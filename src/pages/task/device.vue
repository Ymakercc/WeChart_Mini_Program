<template>
  <view class="page">
    <!-- 导航栏 -->
    <uni-nav-bar
      fixed
      status-bar
      left-icon="back"
      :title="deviceInfo.itemName || '设备详情'"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!-- 内容区域 -->
    <view class="content">
      <!-- 检查项列表 -->
      <scroll-view class="item-list" scroll-y>
        <view
          class="item-card"
          v-for="item in itemList"
          :key="item.recordId"
          @tap="openDetailModal(item)"
        >
          <!-- 检查项信息 -->
          <view class="item-top">
            <view class="item-info">
              <text class="item-name">{{ item.itemName }}</text>
              <text class="item-code">{{ item.itemCode }}</text>
            </view>

            <!-- 状态按钮组 -->
            <view class="btn-group">
              <view
                class="check-btn normal"
                :class="{ active: item.checkResult === '1' }"
                @tap.stop="handleQuickAction(item, '1')"
              >
                <text>正常</text>
              </view>
              <view
                class="check-btn fault"
                :class="{ active: item.checkResult === '2' }"
                @tap.stop="handleQuickAction(item, '2')"
              >
                <text>故障</text>
              </view>
              <view
                class="check-btn none"
                :class="{ active: item.checkResult === '3' }"
                @tap.stop="handleQuickAction(item, '3')"
              >
                <text>无此设备</text>
              </view>
            </view>
          </view>

          <!-- 故障描述区域 (仅故障状态显示) -->
          <view class="fault-area" v-if="item.checkResult === '2'" @tap.stop>
            <textarea
              class="fault-input"
              v-model="item.faultDescription"
              placeholder="请输入故障描述..."
              :maxlength="500"
              auto-height
            />
            <view class="save-btn" @tap="saveFaultDesc(item)">
              <text>保存描述</text>
            </view>
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="loading-state" v-if="loading">
          <text>加载中...</text>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="itemList.length === 0 && !loading">
          <text class="empty-text">暂无检查项</text>
        </view>
      </scroll-view>
    </view>

    <!-- 检查详情弹窗 -->
    <view class="modal-overlay" v-if="showModal" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">检查详情</text>
          <view class="close-icon" @tap="closeModal">×</view>
        </view>

        <scroll-view class="modal-body" scroll-y>
          <view class="modal-padding">
            <!-- 检查问题 (假设从 checkRequirements 或 itemName 获取) -->
            <view class="form-item">
              <text class="form-label"
                >{{ currentItem.itemName }}是否完好?</text
              >
              <view class="radio-group">
                <view
                  class="radio-item"
                  :class="{ active: currentItem.checkResult === '1' }"
                  @tap="updateModalResult('1')"
                >
                  <view class="radio-circle">
                    <view
                      class="radio-inner"
                      v-if="currentItem.checkResult === '1'"
                    ></view>
                  </view>
                  <text>是</text>
                </view>
                <view
                  class="radio-item"
                  :class="{ active: currentItem.checkResult === '2' }"
                  @tap="updateModalResult('2')"
                >
                  <view class="radio-circle">
                    <view
                      class="radio-inner"
                      v-if="currentItem.checkResult === '2'"
                    ></view>
                  </view>
                  <text>否</text>
                </view>
              </view>
            </view>

            <!-- 设备状态 -->
            <view class="form-item">
              <text class="form-label">设备状态:</text>
              <picker
                mode="selector"
                :range="statusOptions"
                range-key="label"
                @change="onStatusChange"
              >
                <view class="picker-view">
                  <text>{{ getStatusLabel(currentItem.checkResult) }}</text>
                  <text class="arrow">▼</text>
                </view>
              </picker>
            </view>

            <!-- 其他说明 -->
            <view class="form-item">
              <text class="form-label">其他说明:</text>
              <textarea
                class="form-textarea"
                v-model="modalForm.otherNotes"
                placeholder="请输入其他说明..."
                :maxlength="200"
              />
            </view>

            <!-- 附件 -->
            <view class="form-item">
              <text class="form-label">附件:</text>
              <view class="upload-area">
                <view class="upload-btn" @tap="chooseImage">
                  <text>选择文件</text>
                </view>
                <text class="upload-tip" v-if="!modalForm.faultImages"
                  >未选择文件</text
                >
                <view class="image-list" v-else>
                  <!-- 简单展示已选图片数量或列表 -->
                  <text
                    >{{ modalForm.faultImages.split(",").length }} 张图片</text
                  >
                </view>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="modal-footer">
          <view class="btn-cancel" @tap="closeModal">取消</view>
          <view class="btn-confirm" @tap="saveDetail">保存</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { onMounted, reactive, ref } from "vue";

const recordId = ref(null);
const taskId = ref(null);
const loading = ref(false);
const deviceInfo = ref({});
const itemList = ref([]);

// 弹窗状态
const showModal = ref(false);
const currentItem = ref({});
const modalForm = reactive({
  otherNotes: "",
  faultImages: "",
});

const statusOptions = [
  { label: "正常", value: "1" },
  { label: "故障", value: "2" },
  { label: "无此设备", value: "3" },
];

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 加载检查项列表
const loadItemList = async () => {
  if (!recordId.value) return;

  try {
    loading.value = true;
    const res = await api.getDeviceDetail(recordId.value);

    if (res.code === 200 || res.code === 0) {
      const data = res.data || {};
      if (data.equipment) {
        deviceInfo.value = data.equipment;
      }
      itemList.value = (data.checkItems || data.items || []).map((item) => ({
        ...item,
        faultDescription: item.faultDescription || "",
        checkResult: item.checkResult || "0", // 默认为0未检查
      }));
    }
  } catch (e) {
    console.error("获取检查项列表失败:", e);
    uni.showToast({ title: "获取检查项列表失败", icon: "none" });
  } finally {
    loading.value = false;
  }
};

// 快捷操作
const handleQuickAction = async (item, result) => {
  if (item.checkResult === result) return;

  const originalResult = item.checkResult;
  item.checkResult = result;

  if (result !== "2") {
    item.faultDescription = "";
  }

  try {
    uni.showLoading({ mask: true });
    // 调用更新检查结果接口
    const res = await api.updateCheckResult({
      recordId: item.recordId,
      checkResult: result,
      taskId: taskId.value,
    });

    if (res.code !== 200 && res.code !== 0) {
      item.checkResult = originalResult;
      uni.showToast({ title: res.msg || "操作失败", icon: "none" });
    }
  } catch (e) {
    item.checkResult = originalResult;
    console.error(e);
    uni.showToast({ title: "操作失败", icon: "none" });
  } finally {
    uni.hideLoading();
  }
};

// 保存故障描述
const saveFaultDesc = async (item) => {
  if (!item.faultDescription || !item.faultDescription.trim()) {
    uni.showToast({ title: "请输入故障描述", icon: "none" });
    return;
  }

  try {
    uni.showLoading({ mask: true });
    const res = await api.updateFaultDesc({
      recordId: item.recordId,
      faultDescription: item.faultDescription,
    });

    if (res.code === 200 || res.code === 0) {
      uni.showToast({ title: "保存成功", icon: "success" });
    } else {
      uni.showToast({ title: res.msg || "保存失败", icon: "none" });
    }
  } catch (e) {
    console.error(e);
    uni.showToast({ title: "保存失败", icon: "none" });
  } finally {
    uni.hideLoading();
  }
};

// 打开详情弹窗
const openDetailModal = (item) => {
  currentItem.value = { ...item }; // 复制一份数据
  modalForm.otherNotes = item.otherNotes || "";
  modalForm.faultImages = item.faultImages || "";
  showModal.value = true;
};

// 关闭弹窗
const closeModal = () => {
  showModal.value = false;
};

// 更新弹窗中的结果
const updateModalResult = (result) => {
  currentItem.value.checkResult = result;
};

// 状态下拉改变
const onStatusChange = (e) => {
  const index = e.detail.value;
  currentItem.value.checkResult = statusOptions[index].value;
};

// 获取状态文本
const getStatusLabel = (val) => {
  const option = statusOptions.find((opt) => opt.value === val);
  return option ? option.label : "请选择";
};

// 选择图片 (简单实现)
const chooseImage = () => {
  uni.chooseImage({
    count: 3,
    success: (res) => {
      // 实际开发中应该上传图片获取URL
      // 这里暂不做上传，仅演示
      uni.showToast({ title: "请先实现文件上传", icon: "none" });
    },
  });
};

// 保存详情
const saveDetail = async () => {
  try {
    uni.showLoading({ mask: true });
    const res = await api.updateCheckDetail({
      recordId: currentItem.value.recordId,
      checkResult: currentItem.value.checkResult,
      faultDescription: currentItem.value.faultDescription, // 从 currentItem 取
      otherNotes: modalForm.otherNotes,
      faultImages: modalForm.faultImages,
    });

    if (res.code === 200 || res.code === 0) {
      uni.showToast({ title: "保存成功", icon: "success" });
      closeModal();
      // 刷新列表数据
      const index = itemList.value.findIndex(
        (i) => i.recordId === currentItem.value.recordId,
      );
      if (index > -1) {
        itemList.value[index] = {
          ...itemList.value[index],
          checkResult: currentItem.value.checkResult,
          otherNotes: modalForm.otherNotes,
          faultImages: modalForm.faultImages,
        };
      }
    } else {
      uni.showToast({ title: res.msg || "保存失败", icon: "none" });
    }
  } catch (e) {
    console.error(e);
    uni.showToast({ title: "保存失败", icon: "none" });
  } finally {
    uni.hideLoading();
  }
};

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  recordId.value = options.recordId;
  taskId.value = options.taskId;

  const cached = uni.getStorageSync("currentDevice");
  if (cached) {
    deviceInfo.value = cached;
  }

  loadItemList();
});
</script>

<style scoped>
.page {
  width: 100vw;
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: calc(16px + env(safe-area-inset-top));
  overflow: hidden;
}

.item-list {
  flex: 1;
}

.item-card {
  background: #fff;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
  padding-right: 20rpx;
}

.item-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.item-code {
  font-size: 24rpx;
  color: #999;
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 16rpx;
  flex-shrink: 0;
}

.check-btn {
  padding: 10rpx 24rpx;
  border-radius: 8rpx;
  border: 2rpx solid;
}

.check-btn text {
  font-size: 24rpx;
}

/* 正常按钮 */
.check-btn.normal {
  border-color: #4caf50;
  color: #4caf50;
}
.check-btn.normal.active {
  background: #4caf50;
  color: #fff;
}
.check-btn.normal.active text {
  color: #fff;
}
.check-btn.normal text {
  color: #4caf50;
}

/* 故障按钮 */
.check-btn.fault {
  border-color: #ef5350;
  color: #ef5350;
}
.check-btn.fault.active {
  background: #ef5350;
  color: #fff;
}
.check-btn.fault.active text {
  color: #fff;
}
.check-btn.fault text {
  color: #ef5350;
}

/* 无此设备按钮 */
.check-btn.none {
  border-color: #ffd740;
  color: #ffca28;
}
.check-btn.none.active {
  background: #ffd740;
  color: #333;
}
.check-btn.none.active text {
  color: #333;
}
.check-btn.none text {
  color: #f9a825;
}

/* 故障描述区域 */
.fault-area {
  margin-top: 20rpx;
}

.fault-input {
  width: 100%;
  min-height: 120rpx;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  background: #fafafa;
}

.save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 16rpx;
  padding: 10rpx 24rpx;
  background: #009688;
  border-radius: 6rpx;
}

.save-btn text {
  color: #fff;
  font-size: 24rpx;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 85%;
  background: #fff;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.modal-header {
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
}

.close-icon {
  font-size: 40rpx;
  color: #999;
  line-height: 1;
}

.modal-body {
  flex: 1;
  height: 0;
}

.modal-padding {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.radio-group {
  display: flex;
  gap: 40rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.radio-circle {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #1976d2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-inner {
  width: 20rpx;
  height: 20rpx;
  background: #1976d2;
  border-radius: 50%;
}

.picker-view {
  border: 2rpx solid #ddd;
  padding: 16rpx 20rpx;
  border-radius: 8rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  padding: 16rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.upload-btn {
  padding: 12rpx 24rpx;
  border: 2rpx solid #ddd;
  border-radius: 6rpx;
  font-size: 26rpx;
  color: #333;
}

.modal-footer {
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

.btn-cancel,
.btn-confirm {
  padding: 12rpx 36rpx;
  border-radius: 6rpx;
  font-size: 28rpx;
}

.btn-cancel {
  border: 2rpx solid #ddd;
  color: #666;
}

.btn-confirm {
  background: #1976d2;
  color: #fff;
  border: 2rpx solid #1976d2;
}

/* 覆盖 uni-nav-bar 样式 */
:deep(.uni-nav-bar-text) {
  font-size: 36rpx !important;
  font-weight: bold !important;
}

:deep(.uni-navbar__header-container) {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  display: flex !important;
  justify-content: center !important;
  pointer-events: none;
}

:deep(.uni-navbar__header-container-inner) {
  pointer-events: auto;
}

:deep(.uni-navbar__header-btns-left) {
  z-index: 10 !important;
  position: relative !important;
}
</style>
