<template>
  <view class="page">
    <!-- 使用 uni-nav-bar 自定义导航栏 -->
    <uni-nav-bar
      class="custom-nav"
      fixed
      status-bar
      left-icon="back"
      title="设备管理"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!-- 内容区域/卡片列表容器 -->
    <scroll-view class="content" scroll-y>
      <view
        class="equipment-card"
        v-for="item in equipmentList"
        :key="item.equipmentId"
        @tap="goDetail(item)"
      >
        <view class="card-header">
          <text class="equipment-name">{{ item.equipmentName }}</text>
          <text class="equipment-status" :class="getStatusClass(item.status)">{{
            item.statusName || getStatusText(item.status)
          }}</text>
        </view>
        <view class="card-content">
          <view class="info-row">
            <view class="info-item">
              <text class="info-label">设备编号</text>
              <text class="info-value">{{ item.equipmentCode }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">设备类型</text>
              <text class="info-value">{{ item.equipmentType }}</text>
            </view>
          </view>
          <view class="info-row">
            <view class="info-item">
              <text class="info-label">所在建筑</text>
              <text class="info-value">{{ item.buildingName }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">楼层</text>
              <text class="info-value">{{ item.floor }}</text>
            </view>
          </view>
          <view class="info-row">
            <view class="info-item full">
              <text class="info-label">位置</text>
              <text class="info-value">{{ item.location }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="equipmentList.length === 0">
        <text class="empty-text">暂无数据</text>
      </view>
    </scroll-view>

    <!-- 添加按钮 -->
    <view class="add-btn" @tap="goAdd">
      <text class="add-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { onMounted, onUnmounted, ref } from "vue";

const equipmentList = ref([]);

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转到添加页面
const goAdd = () => {
  uni.navigateTo({
    url: "/pages/equipment/form",
  });
};

// 跳转到详情页面
const goDetail = (item) => {
  uni.setStorageSync("currentEquipment", item);
  uni.navigateTo({
    url: `/pages/equipment/detail?id=${item.equipmentId}`,
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

// 加载设备列表
const loadEquipmentList = async () => {
  try {
    const companyId = uni.getStorageSync("selectedCompanyId");
    if (!companyId) {
      uni.showToast({ title: "请先选择公司", icon: "none" });
      return;
    }

    const res = await api.getEquipmentList({
      companyId: companyId,
      buildingId: "",
      equipmentType: "",
      status: "",
      pageNum: 1,
      pageSize: 50,
    });

    if (res.code === 200 || res.code === 0) {
      const data = res.rows || res.data || [];
      equipmentList.value = Array.isArray(data)
        ? data
        : data.rows || data.list || [];
    } else {
      equipmentList.value = [];
    }
  } catch (e) {
    console.error("获取设备列表失败:", e);
    uni.showToast({ title: "获取设备列表失败", icon: "none" });
    equipmentList.value = [];
  }
};

// 刷新列表的事件处理函数
const handleRefresh = () => {
  loadEquipmentList();
};

onMounted(() => {
  loadEquipmentList();
  uni.$on("refreshEquipmentList", handleRefresh);
});

onUnmounted(() => {
  uni.$off("refreshEquipmentList", handleRefresh);
});
</script>

<style scoped>
.page {
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 内容区域/卡片列表容器 */
.content {
  flex: 1;
  padding: 20rpx;
  padding-top: calc(16px + env(safe-area-inset-top) + 20rpx);
  background: #f5f5f5;
  box-sizing: border-box;
}

.equipment-card {
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.equipment-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #fff;
}

.equipment-status {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  color: #fff;
}

.status-normal {
  background: rgba(76, 175, 80, 0.9);
}

.status-warning {
  background: rgba(255, 152, 0, 0.9);
}

.status-error {
  background: rgba(244, 67, 54, 0.9);
}

.card-content {
  padding: 20rpx 30rpx;
}

.info-row {
  display: flex;
  margin-bottom: 16rpx;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  flex: 1;
  display: flex;
}

.info-item.full {
  flex: none;
  width: 100%;
}

.info-label {
  font-size: 26rpx;
  color: #666;
  margin-right: 10rpx;
}

.info-value {
  font-size: 26rpx;
  color: #333;
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 添加按钮 */
.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(229, 57, 53, 0.4);
  z-index: 100;
}

.add-icon {
  font-size: 56rpx;
  color: #fff;
  font-weight: 300;
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
</style>
