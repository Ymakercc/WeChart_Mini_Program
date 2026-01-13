<template>
  <view class="page">
    <!-- 导航栏 -->
    <uni-nav-bar
      fixed
      status-bar
      left-icon="back"
      title="设备信息"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y>
      <view class="form-card">
        <!-- 所在建筑 -->
        <view class="form-item">
          <text class="form-label">所在建筑</text>
          <text class="form-value">{{ formData.buildingName || "-" }}</text>
        </view>

        <!-- 所在楼层 -->
        <view class="form-item">
          <text class="form-label">所在楼层</text>
          <text class="form-value">{{ formData.floor || "-" }}</text>
        </view>

        <!-- 系统名称 -->
        <view class="form-item">
          <text class="form-label">系统名称</text>
          <text class="form-value">{{ formData.equipmentType || "-" }}</text>
        </view>

        <!-- 设备名称 -->
        <view class="form-item">
          <text class="form-label">设备名称</text>
          <text class="form-value">{{ formData.equipmentName || "-" }}</text>
        </view>

        <!-- 生产厂家 -->
        <view class="form-item">
          <text class="form-label">生产厂家</text>
          <text class="form-value">{{ formData.manufacturer || "-" }}</text>
        </view>

        <!-- 有效日期 -->
        <view class="form-item">
          <text class="form-label">有效日期</text>
          <text class="form-value">{{ formData.expiryDate || "-" }}</text>
        </view>

        <!-- 设备数量 -->
        <view class="form-item">
          <text class="form-label">设备数量</text>
          <text class="form-value">{{ formData.quantity || "-" }}</text>
        </view>

        <!-- 具体位置 -->
        <view class="form-item">
          <text class="form-label">具体位置</text>
          <text class="form-value">{{ formData.location || "-" }}</text>
        </view>

        <!-- 规格型号 -->
        <view class="form-item">
          <text class="form-label">规格型号</text>
          <text class="form-value">{{ formData.specification || "-" }}</text>
        </view>

        <!-- 设备标识 -->
        <view class="form-item last">
          <text class="form-label">设备标识</text>
          <text class="form-value ellipsis">{{
            formData.equipmentCode || "-"
          }}</text>
        </view>
      </view>

      <!-- 前往巡查按钮 -->
      <view class="btn-container">
        <view class="action-btn" @tap="goEdit">
          <text>前往巡查</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { onMounted, ref } from "vue";

const equipmentId = ref(null);
const loading = ref(false);

const formData = ref({
  equipmentId: null,
  companyId: null,
  buildingId: null,
  buildingName: "",
  floor: "",
  systemType: "",
  systemName: "",
  equipmentName: "",
  equipmentCode: "",
  manufacturer: "",
  expiryDate: "",
  quantity: 1,
  location: "",
  specification: "",
});

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 加载详情
const loadDetail = async () => {
  if (!equipmentId.value) return;

  try {
    loading.value = true;
    uni.showLoading({ title: "加载中...", mask: true });

    const res = await api.getEquipmentDetail(equipmentId.value);
    if (res.code === 200 || res.code === 0) {
      const data = res.data || res;

      formData.value = {
        equipmentId: data.equipmentId,
        companyId: data.companyId,
        buildingId: data.buildingId,
        buildingName: data.buildingName || "",
        floor: data.floor || "",
        equipmentType: data.systemType || data.equipmentType || "",
        systemName: data.systemName || data.equipmentTypeName || "",
        equipmentName: data.equipmentName || "",
        equipmentCode: data.equipmentCode || data.equipmentId || "",
        manufacturer: data.manufacturer || data.producer || "",
        expiryDate: data.expiryDate || data.validDate || "",
        quantity: data.quantity || data.equipmentCount || 1,
        location: data.location || "",
        specification: data.specification || data.model || "",
      };

      // 缓存数据供编辑页面使用
      uni.setStorageSync("currentEquipment", formData.value);
    } else {
      // 从缓存获取
      const cached = uni.getStorageSync("currentEquipment");
      if (cached) {
        formData.value = cached;
      }
    }
  } catch (e) {
    console.error("获取详情失败", e);
    const cached = uni.getStorageSync("currentEquipment");
    if (cached) {
      formData.value = cached;
    }
  } finally {
    loading.value = false;
    uni.hideLoading();
  }
};

// 前往编辑页面
const goEdit = () => {
  uni.navigateTo({
    url: `/pages/equipment/edit?id=${formData.value.equipmentId}`,
  });
};

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const id = currentPage.options?.id;
  if (id) {
    equipmentId.value = id;
    loadDetail();
  }
});
</script>

<style scoped>
.page {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 20rpx;
  padding-top: calc(16px + env(safe-area-inset-top) + 20rpx);
  box-sizing: border-box;
}

/* 表单卡片 */
.form-card {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 28rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.form-item.last {
  border-bottom: none;
}

.form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
}

.form-value {
  flex: 1;
  font-size: 28rpx;
  color: #1976d2;
  text-align: left;
}

.form-value.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 按钮区域 */
.btn-container {
  margin-top: 40rpx;
  padding: 0 20rpx 40rpx;
}

.action-btn {
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2rpx solid #1976d2;
}

.action-btn text {
  color: #1976d2;
  font-size: 32rpx;
  font-weight: bold;
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
