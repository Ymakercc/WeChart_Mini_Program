<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">设备详情</text>
      <view class="nav-edit" @tap="goEdit">
        <text class="edit-text">编辑</text>
      </view>
    </view>

    <!-- 详情内容 - 使用表单样式 -->
    <scroll-view class="form-content" scroll-y>
      <!-- 设备编号 -->
      <view class="form-item">
        <text class="form-label">设备编号</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.equipmentCode || "-" }}</text>
        </view>
      </view>

      <!-- 设备名称 -->
      <view class="form-item">
        <text class="form-label">设备名称</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.equipmentName || "-" }}</text>
        </view>
      </view>

      <!-- 设备类型 -->
      <view class="form-item">
        <text class="form-label">设备类型</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.equipmentType || "-" }}</text>
        </view>
      </view>

      <!-- 品牌 -->
      <view class="form-item">
        <text class="form-label">品牌</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.brand || "-" }}</text>
        </view>
      </view>

      <!-- 型号 -->
      <view class="form-item">
        <text class="form-label">型号</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.model || "-" }}</text>
        </view>
      </view>

      <!-- 规格 -->
      <view class="form-item">
        <text class="form-label">规格</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.specifications || "-" }}</text>
        </view>
      </view>

      <!-- 状态 -->
      <view class="form-item">
        <text class="form-label">状态</text>
        <view class="form-value-wrapper">
          <text
            class="form-value status"
            :class="getStatusClass(detail.status)"
          >
            {{ detail.statusName || getStatusText(detail.status) }}
          </text>
        </view>
      </view>

      <!-- 分隔线 -->
      <view class="section-divider"></view>

      <!-- 所属公司 -->
      <view class="form-item">
        <text class="form-label">所属公司</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.companyName || "-" }}</text>
        </view>
      </view>

      <!-- 所在建筑 -->
      <view class="form-item">
        <text class="form-label">所在建筑</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.buildingName || "-" }}</text>
        </view>
      </view>

      <!-- 楼层 -->
      <view class="form-item">
        <text class="form-label">楼层</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.floor || "-" }}</text>
        </view>
      </view>

      <!-- 具体位置 -->
      <view class="form-item">
        <text class="form-label">具体位置</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.location || "-" }}</text>
        </view>
      </view>

      <!-- 分隔线 -->
      <view class="section-divider"></view>

      <!-- 安装日期 -->
      <view class="form-item">
        <text class="form-label">安装日期</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.installDate || "-" }}</text>
        </view>
      </view>

      <!-- 生产日期 -->
      <view class="form-item">
        <text class="form-label">生产日期</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.productionDate || "-" }}</text>
        </view>
      </view>

      <!-- 保修截止 -->
      <view class="form-item">
        <text class="form-label">保修截止</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.warrantyEndDate || "-" }}</text>
        </view>
      </view>

      <!-- 上次维保 -->
      <view class="form-item">
        <text class="form-label">上次维保</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{
            detail.lastMaintenanceDate || "-"
          }}</text>
        </view>
      </view>

      <!-- 下次维保 -->
      <view class="form-item">
        <text class="form-label">下次维保</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{
            detail.nextMaintenanceDate || "-"
          }}</text>
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-item" v-if="detail.remark">
        <text class="form-label">备注</text>
        <view class="form-value-wrapper">
          <text class="form-value">{{ detail.remark }}</text>
        </view>
      </view>

      <!-- 设备图片 -->
      <view class="form-item image-section" v-if="detail.qrCode">
        <text class="form-label">设备二维码</text>
        <view class="image-wrapper">
          <image :src="detail.qrCode" mode="aspectFit" class="qr-image"></image>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { onMounted, ref } from "vue";

const detail = ref({});

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转编辑
const goEdit = () => {
  uni.navigateTo({
    url: `/pages/equipment/form?id=${detail.value.equipmentId}`,
  });
};

// 获取状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case "0":
      return "status-normal";
    case "1":
      return "status-warning";
    case "2":
      return "status-error";
    default:
      return "status-normal";
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case "0":
      return "正常";
    case "1":
      return "待维护";
    case "2":
      return "故障";
    default:
      return "正常";
  }
};

// 加载设备详情
const loadDetail = async (id) => {
  try {
    const res = await api.getEquipmentDetail(id);
    if (res.code === 200 && res.data) {
      detail.value = res.data;
    } else {
      // 尝试从缓存获取
      const cached = uni.getStorageSync("currentEquipment");
      if (cached) {
        detail.value = cached;
      }
    }
  } catch (e) {
    console.error("获取设备详情失败", e);
    // 使用缓存数据
    const cached = uni.getStorageSync("currentEquipment");
    if (cached) {
      detail.value = cached;
    }
  }
};

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  if (options.id) {
    loadDetail(options.id);
  } else {
    // 从缓存获取
    const cached = uni.getStorageSync("currentEquipment");
    if (cached) {
      detail.value = cached;
    }
  }
});
</script>

<style scoped>
.page {
  width: 100vw;
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: calc(160rpx + env(safe-area-inset-top));
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  padding-top: calc(60rpx + env(safe-area-inset-top));
  box-sizing: border-box;
}

.nav-back,
.nav-edit {
  width: 80rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
}

.nav-back {
  justify-content: flex-start;
}

.nav-edit {
  justify-content: flex-end;
}

.back-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}

.edit-text {
  font-size: 28rpx;
  color: #fff;
}

.nav-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
}

/* 表单内容 */
.form-content {
  flex: 1;
  margin-top: calc(160rpx + env(safe-area-inset-top));
  padding-bottom: 40rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 28rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #666;
  flex-shrink: 0;
}

.form-value-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
}

.form-value {
  font-size: 28rpx;
  color: #333;
}

.form-value.status {
  font-weight: 500;
}

.status-normal {
  color: #4caf50;
}

.status-warning {
  color: #ff9800;
}

.status-error {
  color: #f44336;
}

/* 分隔线 */
.section-divider {
  height: 20rpx;
  background: #f5f5f5;
}

/* 图片区域 */
.image-section {
  flex-direction: column;
  align-items: flex-start;
}

.image-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20rpx;
}

.qr-image {
  width: 300rpx;
  height: 300rpx;
}
</style>
