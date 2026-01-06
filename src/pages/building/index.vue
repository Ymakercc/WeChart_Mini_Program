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
        :key="item.id"
        @tap="goDetail(item)"
      >
        <view class="card-header">
          <text class="building-name">{{ item.name }}</text>
        </view>
        <view class="card-content">
          <view class="info-row">
            <view class="info-item">
              <text class="info-label">建筑高度</text>
              <text class="info-value">{{ item.height }}m</text>
            </view>
            <view class="info-item">
              <text class="info-label">建筑楼层</text>
              <text class="info-value">{{ item.totalFloors }}层</text>
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
              <text class="info-value">{{ item.buildingArea }}m²</text>
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
import { onMounted, ref } from "vue";

const buildingList = ref([]);

// 假数据
const mockBuildingList = [
  {
    id: 1,
    name: "滨海支行",
    height: 4.6,
    totalFloors: 1,
    aboveGroundFloors: 1,
    undergroundFloors: 0,
    landArea: 594.52,
    buildingArea: 594.52,
    hasFireFacilities: true,
    address: "阳江市江城区东风二路东怡花园",
    buildingType: "单、多层民用建筑",
    safetyExits: 2,
    evacuationStairs: 1,
    fireElevators: 0,
    refugeFloor: "",
  },
  {
    id: 2,
    name: "东怡支行",
    height: 4.6,
    totalFloors: 1,
    aboveGroundFloors: 1,
    undergroundFloors: 0,
    landArea: 500,
    buildingArea: 500,
    hasFireFacilities: true,
    address: "阳江市江城区东风二路东怡花园",
    buildingType: "单、多层民用建筑",
    safetyExits: 2,
    evacuationStairs: 0,
    fireElevators: 0,
    refugeFloor: "",
  },
  {
    id: 3,
    name: "江城支行",
    height: 4.6,
    totalFloors: 1,
    aboveGroundFloors: 1,
    undergroundFloors: 0,
    landArea: 420,
    buildingArea: 420,
    hasFireFacilities: true,
    address: "阳江市江城区建设路",
    buildingType: "单、多层民用建筑",
    safetyExits: 2,
    evacuationStairs: 1,
    fireElevators: 0,
    refugeFloor: "",
  },
  {
    id: 4,
    name: "阳春支行",
    height: 4.6,
    totalFloors: 1,
    aboveGroundFloors: 1,
    undergroundFloors: 0,
    landArea: 659.95,
    buildingArea: 659.95,
    hasFireFacilities: false,
    address: "阳春市迎宾大道",
    buildingType: "单、多层民用建筑",
    safetyExits: 2,
    evacuationStairs: 1,
    fireElevators: 0,
    refugeFloor: "",
  },
  {
    id: 5,
    name: "阳东支行",
    height: 4.6,
    totalFloors: 2,
    aboveGroundFloors: 2,
    undergroundFloors: 0,
    landArea: 439.49,
    buildingArea: 439.49,
    hasFireFacilities: true,
    address: "阳江市阳东区金山路",
    buildingType: "单、多层民用建筑",
    safetyExits: 2,
    evacuationStairs: 1,
    fireElevators: 0,
    refugeFloor: "",
  },
  {
    id: 6,
    name: "阳江分行本部",
    height: 46,
    totalFloors: 13,
    aboveGroundFloors: 13,
    undergroundFloors: 0,
    landArea: 800,
    buildingArea: 2400,
    hasFireFacilities: true,
    address: "阳江市东风三路38号景湖花园综合楼",
    buildingType: "高层民用建筑",
    safetyExits: 4,
    evacuationStairs: 2,
    fireElevators: 1,
    refugeFloor: "7层",
  },
];

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
    url: `/pages/building/detail?id=${item.id}`,
  });
};

// 加载建筑列表
const loadBuildingList = async () => {
  try {
    // TODO: 替换为真实接口
    // const res = await api.getBuildingList();
    // if (res.data) {
    //   buildingList.value = res.data;
    // }

    // 使用假数据
    buildingList.value = mockBuildingList;
  } catch (e) {
    console.error("获取建筑列表失败:", e);
    buildingList.value = mockBuildingList;
  }
};

onMounted(() => {
  loadBuildingList();
});

// 页面显示时刷新数据（从新增/编辑页面返回时）
uni.$on("refreshBuildingList", () => {
  loadBuildingList();
});
</script>

<style scoped>
.page {
  width: 100vw;
  /* height: 100vh; */
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
