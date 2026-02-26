<template>
  <view class="page">
    <!-- 使用 uni-nav-bar 自定义导航栏 -->
    <uni-nav-bar
      class="custom-nav"
      fixed
      status-bar
      left-icon="back"
      title="设备信息"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!--内容区域-->
    <view class="content">
      <!--tab切换区域-->
      <view class="tab">
        <view
          class="tab-item"
          :class="{ active: activeTab === 'input' }"
          @tap="activeTab = 'input'"
          >信息录入</view
        >
        <view
          class="tab-item"
          :class="{ active: activeTab === 'scan' }"
          @tap="handleScanTab"
          >扫码采集</view
        >
      </view>

      <!-- 信息录入表单 -->
      <scroll-view v-if="activeTab === 'input'" class="form-container" scroll-y>
        <uni-forms
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="160rpx"
          label-align="left"
        >
          <!-- 所在建筑 -->
          <uni-forms-item label="所在建筑" name="buildingId">
            <view class="picker-wrapper" @tap="showBuildingPicker = true">
              <text v-if="!formData.buildingName" class="placeholder"
                >请选择</text
              >
              <text v-else>{{ formData.buildingName }}</text>
              <text class="arrow">›</text>
            </view>
          </uni-forms-item>

          <!-- 所在楼层 -->
          <uni-forms-item label="所在楼层" name="floorNo">
            <uni-easyinput
              v-model="formData.floorNo"
              placeholder="请输入所在楼层"
            />
          </uni-forms-item>

          <!-- 系统名称 -->
          <uni-forms-item label="系统名称" name="systemName">
            <uni-easyinput
              v-model="formData.systemName"
              placeholder="请输入系统名称"
            />
          </uni-forms-item>

          <!-- 项目类别 -->
          <uni-forms-item label="项目类别" name="projectCategory">
            <view class="picker-wrapper" @tap="showProjectCategoryPicker = true">
              <text v-if="!formData.projectCategory" class="placeholder"
                >请选择</text
              >
              <text v-else>{{ formData.projectCategory }}</text>
              <text class="arrow">›</text>
            </view>
          </uni-forms-item>

          <!-- 设备名称 -->
          <uni-forms-item label="设备名称" name="equipmentName" required>
            <uni-easyinput
              v-model="formData.equipmentName"
              placeholder="请选择或输入"
            />
          </uni-forms-item>

          <!-- 生产厂家 -->
          <uni-forms-item label="生产厂家" name="manufacturer">
            <uni-easyinput
              v-model="formData.manufacturer"
              placeholder="请输入并选择生产厂家"
            />
          </uni-forms-item>

          <!-- 有效日期 -->
          <uni-forms-item label="有效日期" name="expireDate">
            <uni-datetime-picker
              type="date"
              v-model="formData.expireDate"
              :clear-icon="false"
            />
          </uni-forms-item>

          <!-- 设备数量 -->
          <uni-forms-item label="设备数量" name="quantity">
            <uni-number-box
              v-model="formData.quantity"
              :min="1"
              :max="999"
              color="#e53935"
            />
          </uni-forms-item>

          <!-- 具体位置 -->
          <uni-forms-item label="具体位置" name="location" required>
            <uni-easyinput
              v-model="formData.location"
              placeholder="必填"
            />
          </uni-forms-item>

          <!-- 规格型号 -->
          <uni-forms-item label="规格型号" name="model">
            <uni-easyinput
              v-model="formData.model"
              placeholder="选填"
            />
          </uni-forms-item>
        </uni-forms>

        <!-- 图片上传 -->
        <view class="upload-section">
          <view class="upload-label">设备图片：</view>
          <view class="upload-grid">
            <view
              class="upload-item"
              v-for="(img, idx) in imageList"
              :key="idx"
            >
              <image
                :src="img.tempPath"
                mode="aspectFill"
                @tap="previewImage(idx)"
              />
              <view class="delete-icon" @tap="removeImage(idx)">×</view>
            </view>
            <view
              class="upload-btn"
              v-if="imageList.length < 4"
              @tap="chooseImage"
            >
              <uni-icons type="camera" size="32" color="#999" />
            </view>
          </view>
        </view>

        <!-- 保存按钮 -->
        <view class="save-btn" @tap="handleSave">
          <text>保存</text>
        </view>
      </scroll-view>
    </view>

    <!-- 建筑选择器 -->
    <uni-popup ref="buildingPopup" type="bottom" v-if="showBuildingPicker">
      <view class="picker-popup">
        <view class="picker-header">
          <text @tap="showBuildingPicker = false">取消</text>
          <text class="picker-title">选择建筑</text>
          <text @tap="confirmBuilding">确定</text>
        </view>
        <picker-view
          :value="[buildingIndex]"
          @change="onBuildingChange"
          class="picker-view"
        >
          <picker-view-column>
            <view
              class="picker-item"
              v-for="item in buildingList"
              :key="item.buildingId"
            >
              {{ item.buildingName }}
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </uni-popup>

    <!-- 建筑选择器遮罩 -->
    <view
      class="picker-mask"
      v-if="showBuildingPicker"
      @tap="showBuildingPicker = false"
    >
      <view class="picker-popup" @tap.stop>
        <view class="picker-header">
          <text @tap="showBuildingPicker = false">取消</text>
          <text class="picker-title">选择建筑</text>
          <text @tap="confirmBuilding">确定</text>
        </view>
        <picker-view
          :value="[buildingIndex]"
          @change="onBuildingChange"
          class="picker-view"
        >
          <picker-view-column>
            <view
              class="picker-item"
              v-for="item in buildingList"
              :key="item.buildingId"
            >
              {{ item.buildingName }}
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>

    <!-- 项目类别选择器遮罩 -->
    <view
      class="picker-mask"
      v-if="showProjectCategoryPicker"
      @tap="showProjectCategoryPicker = false"
    >
      <view class="picker-popup" @tap.stop>
        <view class="picker-header">
          <text @tap="showProjectCategoryPicker = false">取消</text>
          <text class="picker-title">选择项目类别</text>
          <text @tap="confirmProjectCategory">确定</text>
        </view>
        <picker-view
          :value="[projectCategoryIndex]"
          @change="onProjectCategoryChange"
          class="picker-view"
        >
          <picker-view-column>
            <view
              class="picker-item"
              v-for="item in projectCategoryList"
              :key="item.value"
            >
              {{ item.label }}
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import api, { BASE_URL } from "@/api/index";
import { onMounted, ref } from "vue";

const activeTab = ref("input");
const formRef = ref(null);
const isEdit = ref(false);
const equipmentId = ref(null);

const formData = ref({
  equipmentCode: "", // 设备编号（后台自动生成，但在前端这里可能保留用于显示或编辑）
  buildingId: "",
  buildingName: "",
  floorNo: "", // 所在楼层
  systemName: "", // 系统名称
  projectCategory: "", // 项目类别
  equipmentName: "",
  manufacturer: "", // 生产厂家
  expireDate: "", // 有效日期
  quantity: 1,
  location: "",
  model: "", // 规格型号
});

// 图片列表
const imageList = ref([]);

const rules = {
  equipmentName: {
    rules: [{ required: true, errorMessage: "请输入设备名称" }],
  },
  location: { rules: [{ required: true, errorMessage: "请输入具体位置" }] },
};

const buildingList = ref([]);
const projectCategoryList = ref([]); // 项目类别列表

const showBuildingPicker = ref(false);
const showProjectCategoryPicker = ref(false);

const buildingIndex = ref(0);
const projectCategoryIndex = ref(0);

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 获取当前公司ID
const getCurrentCompanyId = async () => {
  try {
    const res = await api.getCurrentCompany();
    if ((res.code === 200 || res.code === 0) && res.data) {
      return res.data.companyId;
    }
  } catch (e) {
    console.error("获取当前公司失败:", e);
  }
  return null;
};

// 加载建筑列表
const loadBuildings = async () => {
  try {
    const companyId = await getCurrentCompanyId();
    if (!companyId) return;

    const res = await api.getBuildingList({
      companyId: companyId,
      pageNum: 1,
      pageSize: 100,
    });

    if (res.code === 200 || res.code === 0) {
      buildingList.value = res.rows || res.data || [];
    }
  } catch (e) {
    console.error("获取建筑列表失败", e);
  }
};

// 加载项目类别列表
const loadProjectCategories = async () => {
  try {
    const res = await api.getSystemTypes();
    if (res.code === 200 || res.code === 0) {
      // 接口返回 [{value: 'code', label: 'name'}]
      projectCategoryList.value = res.data || [];
    }
  } catch (e) {
    console.error("获取项目类别失败", e);
  }
};

// 建筑选择
const onBuildingChange = (e) => {
  buildingIndex.value = e.detail.value[0];
};

const confirmBuilding = () => {
  if (buildingList.value.length > 0) {
    const selected = buildingList.value[buildingIndex.value];
    formData.value.buildingId = selected.buildingId;
    formData.value.buildingName = selected.buildingName;
  }
  showBuildingPicker.value = false;
};

// 项目类别选择
const onProjectCategoryChange = (e) => {
  projectCategoryIndex.value = e.detail.value[0];
};

const confirmProjectCategory = () => {
  if (projectCategoryList.value.length > 0) {
    const selected = projectCategoryList.value[projectCategoryIndex.value];
    formData.value.projectCategory = selected.label; // 保存名称
  }
  showProjectCategoryPicker.value = false;
};

// 从扫码结果中提取设备编码
const extractEquipmentCode = (scanResult) => {
  // 如果扫码结果是URL，提取最后一段作为设备编码
  if (scanResult.startsWith("http://") || scanResult.startsWith("https://")) {
    const parts = scanResult.split("/");
    return parts[parts.length - 1]; // 取URL最后一段
  }
  // 如果不是URL，直接返回扫码结果
  return scanResult;
};

// 扫码
const handleScan = () => {
  uni.scanCode({
    success: async (res) => {
      try {
        const equipmentCode = extractEquipmentCode(res.result);
        console.log("扫码结果:", res.result, "提取的设备编码:", equipmentCode);
        const scanRes = await api.scanEquipment(equipmentCode);
        if ((scanRes.code === 200 || scanRes.code === 0) && scanRes.data) {
          const data = scanRes.data;
          // 将API返回的字段映射到表单字段
          formData.value.equipmentCode = data.equipmentCode || "";
          formData.value.equipmentName = data.equipmentName || "";
          formData.value.buildingId = data.buildingId || "";
          formData.value.buildingName = data.buildingName || "";
          formData.value.floorNo = data.floorNo || ""; 
          formData.value.systemName = data.systemName || ""; 
          formData.value.projectCategory = data.projectCategory || "";
          formData.value.manufacturer = data.manufacturer || ""; 
          formData.value.expireDate = data.expireDate || ""; 
          formData.value.quantity = data.quantity || 1;
          formData.value.location = data.location || "";
          formData.value.model = data.model || ""; 
          
          activeTab.value = "input";
          uni.showToast({ title: "扫码成功", icon: "success" });
        } else {
          uni.showToast({
            title: scanRes.msg || "未找到设备信息",
            icon: "none",
          });
        }
      } catch (e) {
        console.error("扫码失败:", e);
        uni.showToast({ title: "扫码失败", icon: "none" });
      }
    },
    fail: () => {
      uni.showToast({ title: "扫码取消", icon: "none" });
    },
  });
};

// 点击扫码Tab时直接触发扫码
const handleScanTab = () => {
  activeTab.value = "scan";
  handleScan();
};

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 4 - imageList.value.length,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      res.tempFilePaths.forEach((path) => {
        uploadImg(path);
      });
    },
  });
};

// 上传图片
const uploadImg = (tempPath) => {
  const imgObj = { tempPath: tempPath, serverUrl: "", uploading: true };
  imageList.value.push(imgObj);
  const currentIndex = imageList.value.length - 1;

  const token = uni.getStorageSync("token");

  uni.uploadFile({
    url: BASE_URL + "/common/upload",
    filePath: tempPath,
    name: "file",
    formData: {},
    header: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    success: (uploadRes) => {
      try {
        const res = JSON.parse(uploadRes.data);
        const url =
          res.url || res.fileName || res.filePath || (res.data && res.data.url);
        if (url) {
          imageList.value[currentIndex].serverUrl = url;
          imageList.value[currentIndex].uploading = false;
        } else {
          imageList.value.splice(currentIndex, 1);
          uni.showToast({ title: res.msg || "上传失败", icon: "none" });
        }
      } catch (e) {
        imageList.value.splice(currentIndex, 1);
        uni.showToast({ title: "上传失败", icon: "none" });
      }
    },
    fail: () => {
      imageList.value.splice(currentIndex, 1);
      uni.showToast({ title: "上传失败", icon: "none" });
    },
  });
};

// 移除图片
const removeImage = (index) => {
  imageList.value.splice(index, 1);
};

// 预览图片
const previewImage = (index) => {
  uni.previewImage({
    urls: imageList.value.map((i) => i.tempPath),
    current: index,
  });
};

// 保存
const handleSave = async () => {
  try {
    await formRef.value.validate();
  } catch (e) {
    return;
  }

  try {
    uni.showLoading({ title: "保存中...", mask: true });

    const companyId = await getCurrentCompanyId();
    // 构造提交数据
    const payload = {
      ...formData.value,
      companyId: companyId,
      image: imageList.value.map((img) => img.serverUrl).join(","), // 字段改为 image 单数字符串
    };

    let res;
    if (isEdit.value && equipmentId.value) {
      payload.equipmentId = equipmentId.value;
      res = await api.editEquipment(payload);
    } else {
      res = await api.addEquipment(payload);
    }

    if (res.code === 200 || res.code === 0) {
      uni.showToast({ title: "保存成功", icon: "success" });
      setTimeout(() => {
        uni.$emit("refreshEquipmentList");
        uni.navigateBack();
      }, 1500);
    } else {
      uni.showToast({ title: res.msg || "保存失败", icon: "none" });
    }
  } catch (e) {
    console.error("保存失败", e);
    uni.showToast({ title: "保存失败", icon: "none" });
  } finally {
    uni.hideLoading();
  }
};

onMounted(() => {
  loadBuildings();
  loadProjectCategories();

  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  if (options.id) {
    isEdit.value = true;
    equipmentId.value = options.id;
    loadEquipmentDetail(options.id);
  } else if (options.fromScan === "true") {
    // 从扫一扫页面跳转过来，读取缓存的设备数据
    const scanData = uni.getStorageSync("scanEquipmentData");
    if (scanData) {
      // 这里的 scanData 已经是 mapped 过的（如果是在 index.js 里 mapping），
      // 或者需要在这里 mapping。假设 index.vue 的 scan 逻辑把原始数据存进去了
      // 但其实这里最好重新 map 一下以防万一
      formData.value = {
        ...formData.value,
        ...scanData,
        // 确保字段一致性
        floorNo: scanData.floorNo || scanData.floor || "",
        systemName: scanData.systemName || scanData.equipmentType || "",
        manufacturer: scanData.manufacturer || scanData.brand || "",
        model: scanData.model || scanData.specifications || "",
        expireDate: scanData.expireDate || scanData.warrantyEndDate || "",
      };
      // 使用后清除缓存
      uni.removeStorageSync("scanEquipmentData");
    }
  }
});

const loadEquipmentDetail = async (id) => {
  try {
    const res = await api.getEquipmentDetail(id);
    if (res.code === 200 && res.data) {
      const data = res.data;
      // 赋值给 formData
      Object.assign(formData.value, data);
      
      // 处理图片显示
      if (data.image) {
        imageList.value = data.image.split(",").map(url => ({
          tempPath: url,
          serverUrl: url,
          uploading: false
        }));
      }
    }
  } catch (e) {
    console.error("获取设备详情失败", e);
  }
};
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
  padding: 20rpx;
  padding-top: calc(16px + env(safe-area-inset-top));
  background: #f5f5f5;
  box-sizing: border-box;
}

/* Tab 切换按钮组 */
.tab {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  flex-shrink: 0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
  background: #fff;
  transition: all 0.3s;
}

.tab-item.active {
  color: #e53935;
  font-weight: bold;
  background: rgba(229, 57, 53, 0.08);
}

.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #e53935;
  border-radius: 2rpx;
}

/* 表单容器 */
.form-container {
  width: 94%;
  flex: 1;
  margin-top: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  padding-bottom: 40rpx;
}

/* 选择器包装 */
.picker-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 70rpx;
}

.picker-wrapper .placeholder {
  color: #999;
  font-size: 28rpx;
}

.picker-wrapper .arrow {
  color: #ccc;
  font-size: 32rpx;
}

/* 保存按钮 */
.save-btn {
  margin-top: 30rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

/* 图片上传 */
.upload-section {
  margin-top: 20rpx;
  padding: 0 0 10rpx;
}

.upload-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.upload-item,
.upload-btn {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  position: relative;
}

.upload-item image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.delete-icon {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 36rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.upload-btn {
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
}

/* 遮罩和弹窗 */
.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.picker-popup {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.picker-header {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #eee;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.picker-header text:first-child {
  color: #999;
  font-size: 28rpx;
}

.picker-header text:last-child {
  color: #e53935;
  font-size: 28rpx;
}

.picker-view {
  width: 100%;
  height: 500rpx;
}

.picker-item {
  line-height: 80rpx;
  text-align: center;
  font-size: 30rpx;
  color: #333;
}

.scan-placeholder text {
  font-size: 28rpx;
  color: #666;
}

.scan-btn {
  margin-top: 40rpx;
  padding: 20rpx 60rpx;
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  border-radius: 40rpx;
  display: inline-flex;
}

.scan-btn text {
  color: #fff;
  font-size: 28rpx;
}

/* 选择器弹窗 */
.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.picker-popup {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}

.picker-header text {
  font-size: 28rpx;
  color: #e53935;
}

.picker-title {
  color: #333 !important;
  font-weight: bold;
}

.picker-view {
  height: 400rpx;
}

.picker-item {
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
}

/* 覆盖 uni-nav-bar 标题样式 */
:deep(.uni-nav-bar-text) {
  font-size: 36rpx !important;
  font-weight: bold !important;
}

/* 让标题容器绝对定位实现真正居中 */
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

/* 确保左侧按钮在标题容器之上可点击 */
:deep(.uni-navbar__header-btns-left) {
  z-index: 10 !important;
  position: relative !important;
}

/* uni-forms 样式调整 */
:deep(.uni-forms-item) {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

:deep(.uni-forms-item__label) {
  font-size: 28rpx !important;
  color: #333 !important;
}

:deep(.uni-easyinput__content) {
  border: none !important;
  background: transparent !important;
}

:deep(.uni-easyinput__content-input) {
  font-size: 28rpx !important;
}
</style>
