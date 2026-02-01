<template>
  <view class="page">
    <!-- 使用 uni-nav-bar 自定义导航栏 -->
    <uni-nav-bar
      class="custom-nav"
      fixed
      status-bar
      left-icon="back"
      :title="isEditing ? '编辑建筑' : '建筑信息'"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!-- 内容区域 -->
    <view class="content">
      <!-- 详情内容 -->
      <scroll-view class="content-item" scroll-y>
        <!-- 白色卡片容器 -->
        <view class="card-wrapper">
          <!-- 建筑编号 -->
          <view class="detail-item">
            <text class="detail-label">建筑编号</text>
            <input
              v-if="isEditing"
              class="detail-input"
              v-model="buildingData.buildingCode"
              placeholder="请输入"
            />
            <text v-else class="detail-value">{{
              buildingData.buildingCode
            }}</text>
          </view>

          <!-- 建筑名称 -->
          <view class="detail-item">
            <text class="detail-label">建筑名称</text>
            <input
              v-if="isEditing"
              class="detail-input"
              v-model="buildingData.buildingName"
              placeholder="请输入"
            />
            <text v-else class="detail-value">{{
              buildingData.buildingName
            }}</text>
          </view>

          <!-- 建筑地址 -->
          <view class="detail-item">
            <text class="detail-label">建筑地址</text>
            <input
              v-if="isEditing"
              class="detail-input"
              v-model="buildingData.address"
              placeholder="请输入"
            />
            <text v-else class="detail-value">{{ buildingData.address }}</text>
          </view>

          <!-- 建筑类别 -->
          <view class="detail-item">
            <text class="detail-label">建筑类别</text>
            <input
              v-if="isEditing"
              class="detail-input"
              v-model="buildingData.buildingType"
              placeholder="请输入"
            />
            <text v-else class="detail-value">{{
              buildingData.buildingType
            }}</text>
          </view>

          <!-- 建筑面积 -->
          <view class="detail-item">
            <text class="detail-label">建筑面积(m²)</text>
            <input
              v-if="isEditing"
              class="detail-input"
              type="digit"
              v-model="buildingData.area"
              placeholder="请输入"
            />
            <text v-else class="detail-value">{{ buildingData.area }}</text>
          </view>

          <!-- 建筑高度 -->
          <view class="detail-item">
            <text class="detail-label">建筑高度(m)</text>
            <input
              v-if="isEditing"
              class="detail-input"
              type="digit"
              v-model="buildingData.buildingHeight"
              placeholder="请输入"
            />
            <text v-else class="detail-value">{{
              buildingData.buildingHeight
            }}</text>
          </view>

          <!-- 建筑层数 -->
          <view class="detail-item">
            <text class="detail-label">建筑层数</text>
            <input
              v-if="isEditing"
              class="detail-input"
              type="number"
              v-model="buildingData.floors"
              placeholder="请输入"
            />
            <text v-else class="detail-value">{{
              buildingData.floors || buildingData.floorCount
            }}</text>
          </view>

          <!-- 地下层数 -->
          <view class="detail-item">
            <text class="detail-label">地下层数</text>
            <input
              v-if="isEditing"
              class="detail-input"
              type="number"
              v-model="buildingData.undergroundFloors"
              placeholder="请输入"
            />
            <text v-else class="detail-value">{{
              buildingData.undergroundFloors
            }}</text>
          </view>

          <!-- 结构类型 -->
          <view class="detail-item">
            <text class="detail-label">结构类型</text>
            <input
              v-if="isEditing"
              class="detail-input"
              v-model="buildingData.structureType"
              placeholder="请输入"
            />
            <text v-else class="detail-value">{{
              buildingData.structureType
            }}</text>
          </view>

          <!-- 耐火等级 -->
          <view class="detail-item">
            <text class="detail-label">耐火等级</text>
            <input
              v-if="isEditing"
              class="detail-input"
              v-model="buildingData.fireResistanceLevel"
              placeholder="请输入"
            />
            <text v-else class="detail-value">{{
              buildingData.fireResistanceLevel
            }}</text>
          </view>

          <!-- 防火分区数 -->
          <view class="detail-item">
            <text class="detail-label">防火分区数</text>
            <input
              v-if="isEditing"
              class="detail-input"
              type="number"
              v-model="buildingData.fireZoneCount"
              placeholder="请输入"
            />
            <text v-else class="detail-value">{{
              buildingData.fireZoneCount
            }}</text>
          </view>

          <!-- 安全出口 -->
          <view class="detail-item">
            <text class="detail-label">安全出口(个)</text>
            <input
              v-if="isEditing"
              class="detail-input"
              type="number"
              v-model="buildingData.evacuationExitCount"
              placeholder="请输入"
            />
            <text v-else class="detail-value">{{
              buildingData.evacuationExitCount ||
              buildingData.emergencyExits ||
              buildingData.safetyExits
            }}</text>
          </view>

          <!-- 竣工日期 -->
          <view class="detail-item">
            <text class="detail-label">竣工日期</text>
            <picker
              v-if="isEditing"
              mode="date"
              class="detail-picker"
              @change="(e) => (buildingData.completionDate = e.detail.value)"
            >
              <text class="detail-input picker-text">{{
                buildingData.completionDate || "请选择"
              }}</text>
            </picker>
            <text v-else class="detail-value">{{
              buildingData.completionDate
            }}</text>
          </view>

          <!-- 备注 -->
          <view class="detail-item last">
            <text class="detail-label">备注</text>
            <input
              v-if="isEditing"
              class="detail-input"
              v-model="buildingData.remark"
              placeholder="请输入"
            />
            <text v-else class="detail-value">{{
              buildingData.remark || "-"
            }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 底部按钮 -->
      <view class="footer">
        <view v-if="isEditing" class="edit-btn" @tap="handleSave">
          <text class="edit-text">保存</text>
        </view>
        <view v-else class="edit-btn" @tap="toggleEdit">
          <text class="edit-text">编辑</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { onMounted, ref } from "vue";

const isEditing = ref(false);

const buildingData = ref({
  buildingId: null,
  buildingCode: "",
  buildingName: "",
  address: "",
  buildingType: "",
  area: "",
  buildingHeight: "",
  floors: "",
  floorCount: "",
  undergroundFloors: "",
  structureType: "",
  fireResistanceLevel: "",
  fireZoneCount: "",
  evacuationExitCount: "",
  emergencyExits: "",
  safetyExits: "",
  completionDate: "",
  remark: "",
  companyId: null,
});

// 返回上一页
const goBack = () => {
  if (isEditing.value) {
    // 如果在编辑模式，先退出编辑
    isEditing.value = false;
  } else {
    uni.navigateBack();
  }
};

// 切换编辑模式
const toggleEdit = () => {
  isEditing.value = true;
};

// 保存编辑
const handleSave = async () => {
  try {
    uni.showLoading({ title: "正在保存..." });

    // 构造提交数据
    const payload = {
      ...buildingData.value,
      buildingId: buildingData.value.buildingId,
      companyId:
        buildingData.value.companyId || uni.getStorageSync("selectedCompanyId"),
      floors: Number(
        buildingData.value.floors || buildingData.value.floorCount || 0,
      ),
      undergroundFloors: Number(buildingData.value.undergroundFloors || 0),
      area: Number(buildingData.value.area || 0),
      buildingHeight: Number(buildingData.value.buildingHeight || 0),
      fireZoneCount: Number(buildingData.value.fireZoneCount || 0),
      evacuationExitCount: Number(buildingData.value.evacuationExitCount || 0),
    };

    const res = await api.updateBuilding(payload);

    if (res.code === 200 || res.code === 0) {
      uni.showToast({ title: "保存成功", icon: "success" });
      // 通知列表页刷新
      uni.$emit("refreshBuildingList");
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      uni.showToast({ title: res.msg || "保存失败", icon: "none" });
    }
  } catch (e) {
    console.error("保存失败:", e);
    uni.showToast({ title: "网络请求失败", icon: "none" });
  } finally {
    uni.hideLoading();
  }
};

// 加载建筑详情
const loadBuildingDetail = async (id) => {
  try {
    uni.showLoading({ title: "获取详情..." });
    const res = await api.getBuildingDetail(id);
    if ((res.code === 200 || res.code === 0) && res.data) {
      buildingData.value = res.data;
    } else {
      // 接口失败，尝试从缓存读取
      const building = uni.getStorageSync("currentBuilding");
      if (building && (building.buildingId == id || building.id == id)) {
        buildingData.value = building;
      } else {
        uni.showToast({ title: "获取详情失败", icon: "none" });
      }
    }
  } catch (e) {
    console.error("获取建筑详情失败:", e);
    const building = uni.getStorageSync("currentBuilding");
    if (building) {
      buildingData.value = building;
    } else {
      uni.showToast({ title: "获取详情出错", icon: "none" });
    }
  } finally {
    uni.hideLoading();
  }
};

// 页面加载
onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const id = currentPage.options?.id;
  if (id) {
    loadBuildingDetail(id);
  }
});
</script>

<style scoped>
.page {
  width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

/* 内容区域 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 20rpx;
  padding-top: calc(16px + env(safe-area-inset-top));
  background: #f5f5f5;
  overflow: hidden;
}

/* 详情内容区域 */
.content-item {
  flex: 1;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

/* 白色卡片容器 */
.card-wrapper {
  padding: 0;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-item.last {
  border-bottom: none;
}

.detail-label {
  width: 200rpx;
  font-size: 28rpx;
  color: #666;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  text-align: right;
  line-height: 1.5;
}

.detail-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  text-align: right;
  border-bottom: 1rpx solid #e53935;
  padding-bottom: 8rpx;
}

.detail-picker {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.picker-text {
  border-bottom: 1rpx solid #e53935;
  padding-bottom: 8rpx;
}

/* 底部按钮 */
.footer {
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.edit-btn {
  width: 80%;
  height: 90rpx;
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}
</style>
