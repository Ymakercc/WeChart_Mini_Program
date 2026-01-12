<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">建筑列表</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 内容区域/卡片列表容器 -->
    <scroll-view class="content" scroll-y>
      <view
        class="building-card"
        v-for="item in buildingList"
        :key="item.buildingId"
        @tap="goDetail(item)"
      >
        <view class="card-header">
          <text class="building-name">{{ item.buildingName }}</text>
        </view>
        <view class="card-content">
          <view class="info-row">
            <view class="info-item">
              <text class="info-label">建筑高度</text>
              <text class="info-value">{{ item.buildingHeight }}m</text>
            </view>
            <view class="info-item">
              <text class="info-label">建筑楼层</text>
              <text class="info-value"
                >{{ item.floors || item.floorCount }}层</text
              >
            </view>
          </view>
          <view class="info-row">
            <view class="info-item">
              <text class="info-label">地上层数</text>
              <text class="info-value">{{ item.aboveGroundFloors }}层</text>
            </view>
            <view class="info-item">
              <text class="info-label">地下层数</text>
              <text class="info-value">{{ item.undergroundFloors }}层</text>
            </view>
          </view>
          <view class="info-row">
            <view class="info-item">
              <text class="info-label">占地面积</text>
              <text class="info-value">{{ item.landArea }}m²</text>
            </view>
            <view class="info-item">
              <text class="info-label">建筑面积</text>
              <text class="info-value">{{ item.area }}m²</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="buildingList.length === 0">
        <text class="empty-text">暂无建筑信息</text>
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

const buildingList = ref([]);

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转到添加页面
const goAdd = () => {
  uni.navigateTo({
    url: "/pages/building/form",
  });
};

// 跳转到详情页面
const goDetail = (item) => {
  // 将建筑信息存入缓存
  uni.setStorageSync("currentBuilding", item);
  uni.navigateTo({
    url: `/pages/building/detail?id=${item.buildingId}`,
  });
};

// 加载建筑列表
const loadBuildingList = async () => {
  try {
    const companyId = uni.getStorageSync("selectedCompanyId");
    if (!companyId) {
      uni.showToast({ title: "请先选择公司", icon: "none" });
      return;
    }

    const res = await api.getBuildingList({
      companyId: companyId,
      buildingName: "",
      pageNum: 1,
      pageSize: 50,
    });

    if (res.code === 200 || res.code === 0) {
      const data = res.rows || res.data || [];
      buildingList.value = Array.isArray(data)
        ? data
        : data.rows || data.list || [];
    } else {
      buildingList.value = [];
    }
  } catch (e) {
    console.error("获取建筑列表失败:", e);
    uni.showToast({ title: "获取建筑列表失败", icon: "none" });
    buildingList.value = [];
  }
};

// 刷新列表的事件处理函数
const handleRefresh = () => {
  loadBuildingList();
};

onMounted(() => {
  loadBuildingList();
  // 注册事件监听器
  uni.$on("refreshBuildingList", handleRefresh);
});

onUnmounted(() => {
  // 清理事件监听器，防止重复注册
  uni.$off("refreshBuildingList", handleRefresh);
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

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}

.nav-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
}

.nav-placeholder {
  width: 60rpx;
}

/* 内容区域/卡片列表容器 */
.content {
  flex: 1;
  padding: 20rpx;
  padding-top: calc(180rpx + env(safe-area-inset-top));
  background: #f5f5f5;
  box-sizing: border-box;
}

.building-card {
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  padding: 20rpx 30rpx;
}

.building-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #fff;
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
</style>
