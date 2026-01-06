<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">建筑信息</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 内容区域 -->
    <view class="content">
      <!-- 详情内容 -->
      <scroll-view class="content-item" scroll-y>
        <!-- 白色卡片容器 -->
        <view class="card-wrapper">
          <!-- 建筑名称 -->
          <view class="detail-item">
            <text class="detail-label">建筑名称</text>
            <text class="detail-value">{{ buildingData.name }}</text>
          </view>

          <!-- 自动消防设施 -->
          <view class="detail-item">
            <text class="detail-label">自动消防设施</text>
            <text class="detail-value">{{
              buildingData.hasFireFacilities ? "有" : "无"
            }}</text>
          </view>

          <!-- 建筑地址 -->
          <view class="detail-item">
            <text class="detail-label">建筑地址</text>
            <text class="detail-value">{{ buildingData.address }}</text>
          </view>

          <!-- 建筑类别 -->
          <view class="detail-item">
            <text class="detail-label">建筑类别</text>
            <text class="detail-value">{{ buildingData.buildingType }}</text>
          </view>

          <!-- 占地面积 -->
          <view class="detail-item">
            <text class="detail-label">占地面积(m²)</text>
            <text class="detail-value">{{ buildingData.landArea }}</text>
          </view>

          <!-- 建筑面积 -->
          <view class="detail-item">
            <text class="detail-label">建筑面积(m²)</text>
            <text class="detail-value">{{ buildingData.buildingArea }}</text>
          </view>

          <!-- 建筑高度 -->
          <view class="detail-item">
            <text class="detail-label">建筑高度(m)</text>
            <text class="detail-value">{{ buildingData.height }}</text>
          </view>

          <!-- 建筑层数 -->
          <view class="detail-item">
            <text class="detail-label">建筑层数</text>
            <text class="detail-value">{{ buildingData.totalFloors }}</text>
          </view>

          <!-- 地上层数 -->
          <view class="detail-item">
            <text class="detail-label">地上层数</text>
            <text class="detail-value">{{
              buildingData.aboveGroundFloors
            }}</text>
          </view>

          <!-- 地下层数 -->
          <view class="detail-item">
            <text class="detail-label">地下层数</text>
            <text class="detail-value">{{
              buildingData.undergroundFloors
            }}</text>
          </view>

          <!-- 安全出口 -->
          <view class="detail-item">
            <text class="detail-label">安全出口(个)</text>
            <text class="detail-value">{{ buildingData.safetyExits }}</text>
          </view>

          <!-- 疏散楼梯数 -->
          <view class="detail-item">
            <text class="detail-label">疏散楼梯数(个)</text>
            <text class="detail-value">{{
              buildingData.evacuationStairs
            }}</text>
          </view>

          <!-- 消防电梯数 -->
          <view class="detail-item">
            <text class="detail-label">消防电梯数(个)</text>
            <text class="detail-value">{{ buildingData.fireElevators }}</text>
          </view>

          <!-- 避难层位置 -->
          <view class="detail-item last">
            <text class="detail-label">避难层位置</text>
            <text class="detail-value">{{
              buildingData.refugeFloor || "-"
            }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 编辑按钮 -->
      <view class="footer">
        <view class="edit-btn" @tap="goEdit">
          <text class="edit-text">编辑</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";

const buildingData = ref({
  id: null,
  name: "",
  hasFireFacilities: false,
  address: "",
  buildingType: "",
  landArea: "",
  buildingArea: "",
  height: "",
  totalFloors: "",
  aboveGroundFloors: "",
  undergroundFloors: "",
  safetyExits: "",
  evacuationStairs: "",
  fireElevators: "",
  refugeFloor: "",
});

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转到编辑页面
const goEdit = () => {
  // 将建筑信息存入缓存用于编辑
  uni.setStorageSync("editBuilding", buildingData.value);
  uni.navigateTo({
    url: "/pages/building/form",
  });
};

// 加载建筑详情
const loadBuildingDetail = async (id) => {
  try {
    // TODO: 替换为真实接口
    // const res = await api.getBuildingDetail(id);
    // if (res.data) {
    //   buildingData.value = res.data;
    // }

    // 从缓存读取数据
    const building = uni.getStorageSync("currentBuilding");
    if (building) {
      buildingData.value = building;
    }
  } catch (e) {
    console.error("获取建筑详情失败:", e);
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

/* 顶部导航 */
.nav-header {
  height: calc(160rpx + env(safe-area-inset-top));
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  padding-top: calc(60rpx + env(safe-area-inset-top));
  box-sizing: border-box;
  flex-shrink: 0;
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

/* 内容区域 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 20rpx;
  background: #f5f5f5;
  overflow: hidden;
}

/* 详情内容区域 - 对应蓝色盒子 */
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

/* 底部编辑 */
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
