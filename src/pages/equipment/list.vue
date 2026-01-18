<template>
  <view class="page">
    <!-- 导航栏 -->
    <uni-nav-bar
      fixed
      status-bar
      left-icon="back"
      :title="typeName"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!-- 内容区域 -->
    <view class="content">
      <!-- 筛选区域 -->
      <view class="filter-section">
        <!-- 搜索框 -->
        <view class="search-box">
          <input
            class="search-input"
            v-model="searchKeyword"
            placeholder="请输入关键字搜索"
            @input="handleSearch"
          />
        </view>

        <!-- 设备巡查状态筛选 -->
        <view class="filter-row">
          <text class="filter-label">设备巡查状态</text>
          <view class="filter-options">
            <view
              class="filter-option"
              :class="{ active: inspectionStatus === '0' }"
              @tap="setInspectionStatus('0')"
            >
              <view
                class="checkbox"
                :class="{ checked: inspectionStatus === '0' }"
              >
                <text v-if="inspectionStatus === '0'" class="check-icon"
                  >✓</text
                >
              </view>
              <text>未巡查</text>
            </view>
            <view
              class="filter-option"
              :class="{ active: inspectionStatus === '1' }"
              @tap="setInspectionStatus('1')"
            >
              <view
                class="checkbox"
                :class="{ checked: inspectionStatus === '1' }"
              >
                <text v-if="inspectionStatus === '1'" class="check-icon"
                  >✓</text
                >
              </view>
              <text>已巡查</text>
            </view>
          </view>
        </view>

        <!-- 巡查设备有效日期筛选 -->
        <view class="filter-row">
          <text class="filter-label">巡查设备有效日期</text>
          <view class="filter-options">
            <view
              class="filter-option"
              :class="{ active: dateStatus === '0' }"
              @tap="setDateStatus('0')"
            >
              <view
                class="radio"
                :class="{ checked: dateStatus === '0' }"
              ></view>
              <text>未过期</text>
            </view>
            <view
              class="filter-option"
              :class="{ active: dateStatus === '1' }"
              @tap="setDateStatus('1')"
            >
              <view
                class="radio"
                :class="{ checked: dateStatus === '1' }"
              ></view>
              <text>已过期</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 设备列表 -->
      <scroll-view class="list-container" scroll-y>
        <view
          class="equipment-card"
          v-for="item in filteredList"
          :key="item.equipmentId"
          @tap="goDetail(item)"
        >
          <!-- 卡片头部 -->
          <view class="card-header">
            <text class="equipment-name">{{ item.equipmentName }}</text>
            <text class="equipment-date">{{
              formatDate(item.createTime)
            }}</text>
          </view>

          <!-- 卡片内容 -->
          <view class="card-content">
            <view class="info-row">
              <view class="info-item">
                <text class="info-label">设备编码</text>
                <text class="info-value">{{ item.equipmentCode || "-" }}</text>
              </view>
              <view class="info-item right">
                <text class="info-label">数量</text>
                <text class="info-value">{{ item.quantity || 1 }}</text>
              </view>
            </view>
            <view class="info-row">
              <view class="info-item">
                <text class="info-label">所在建筑</text>
                <text class="info-value">{{ item.buildingName || "-" }}</text>
              </view>
              <view class="info-item right">
                <text class="info-label">楼层</text>
                <text class="info-value">{{
                  item.floorNo || item.floor || "-"
                }}</text>
              </view>
            </view>
            <view class="info-row">
              <view class="info-item full">
                <text class="info-label">具体位置</text>
                <text class="info-value">{{ item.location || "-" }}</text>
              </view>
            </view>
            <view class="info-row">
              <view class="info-item full">
                <text class="info-label">本月巡查时间</text>
                <text class="info-value" :class="getInspectionClass(item)">{{
                  item.lastInspectionTime || "未巡查"
                }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="filteredList.length === 0">
          <text class="empty-text">暂无数据</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { onShow } from "@dcloudio/uni-app";
import { computed, onMounted, onUnmounted, ref } from "vue";

const typeName = ref("设备列表");
const typeCode = ref("");
const equipmentList = ref([]);
const searchKeyword = ref("");
const inspectionStatus = ref(""); // 0: 未巡查, 1: 已巡查
const dateStatus = ref(""); // 0: 未过期, 1: 已过期

// 筛选后的列表
const filteredList = computed(() => {
  let list = equipmentList.value;

  // 关键字搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase();
    list = list.filter((item) => {
      return (
        (item.equipmentName &&
          item.equipmentName.toLowerCase().includes(keyword)) ||
        (item.equipmentCode &&
          item.equipmentCode.toLowerCase().includes(keyword)) ||
        (item.buildingName &&
          item.buildingName.toLowerCase().includes(keyword)) ||
        (item.location && item.location.toLowerCase().includes(keyword))
      );
    });
  }

  // 巡查状态筛选
  if (inspectionStatus.value === "0") {
    // 未巡查
    list = list.filter((item) => !item.lastInspectionTime);
  } else if (inspectionStatus.value === "1") {
    // 已巡查
    list = list.filter((item) => item.lastInspectionTime);
  }

  // 有效日期筛选
  if (dateStatus.value === "0") {
    // 未过期
    list = list.filter((item) => {
      if (!item.expiryDate) return true;
      return new Date(item.expiryDate) >= new Date();
    });
  } else if (dateStatus.value === "1") {
    // 已过期
    list = list.filter((item) => {
      if (!item.expiryDate) return false;
      return new Date(item.expiryDate) < new Date();
    });
  }

  return list;
});

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转到详情页面
const goDetail = (item) => {
  uni.setStorageSync("currentEquipment", item);
  uni.navigateTo({
    url: `/pages/equipment/detail?id=${item.equipmentId}`,
  });
};

// 搜索处理
const handleSearch = () => {
  // 已通过 computed 自动处理
};

// 设置巡查状态筛选
const setInspectionStatus = (status) => {
  if (inspectionStatus.value === status) {
    inspectionStatus.value = "";
  } else {
    inspectionStatus.value = status;
  }
};

// 设置日期状态筛选
const setDateStatus = (status) => {
  if (dateStatus.value === status) {
    dateStatus.value = "";
  } else {
    dateStatus.value = status;
  }
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.substring(0, 16).replace("T", " ");
};

// 获取巡查状态样式
const getInspectionClass = (item) => {
  return item.lastInspectionTime ? "text-normal" : "text-warning";
};

// 加载设备列表
const loadEquipmentList = async () => {
  try {
    const companyId = uni.getStorageSync("selectedCompanyId");
    if (!companyId) return;

    const res = await api.getEquipmentList({
      companyId: companyId,
      equipmentType: typeCode.value,
      pageNum: 1,
      pageSize: 500,
    });

    if (res.code === 200 || res.code === 0) {
      const data = res.rows || res.data || [];
      // 筛选当前类型的设备 - 优先使用 systemName 进行筛选
      if (typeCode.value) {
        equipmentList.value = data.filter(
          (item) =>
            item.systemName === typeCode.value ||
            item.equipmentType === typeCode.value ||
            item.systemType === typeCode.value,
        );
      } else {
        equipmentList.value = data;
      }
      // 更新缓存
      uni.setStorageSync("currentTypeEquipments", equipmentList.value);
    }
  } catch (e) {
    console.error("加载设备列表失败", e);
  }
};

// 刷新列表
const refreshList = () => {
  loadEquipmentList();
};

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  if (options.typeName) {
    typeName.value = decodeURIComponent(options.typeName);
  }
  if (options.type) {
    typeCode.value = decodeURIComponent(options.type);
  }

  // 从缓存读取该类型的设备列表
  const items = uni.getStorageSync("currentTypeEquipments");
  if (items && Array.isArray(items)) {
    equipmentList.value = items;
  }

  // 监听刷新事件
  uni.$on("refreshEquipmentList", refreshList);
});

// 页面显示时刷新数据
onShow(() => {
  // 从缓存读取该类型的设备列表，避免 API 重新筛选导致数据丢失
  const items = uni.getStorageSync("currentTypeEquipments");
  if (items && Array.isArray(items) && items.length > 0) {
    equipmentList.value = items;
  } else {
    // 只有缓存为空时才重新加载
    loadEquipmentList();
  }
});

onUnmounted(() => {
  uni.$off("refreshEquipmentList", refreshList);
});
</script>

<style scoped>
.page {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 内容区域 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: calc(16px + env(safe-area-inset-top));
  overflow: hidden;
}

/* 筛选区域 */
.filter-section {
  background: #fff;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;
}

/* 搜索框 */
.search-box {
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 16rpx 30rpx;
  margin-bottom: 20rpx;
}

.search-input {
  width: 100%;
  font-size: 28rpx;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

/* 筛选行 */
.filter-row {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
}

.filter-label {
  font-size: 28rpx;
  color: #333;
  width: 200rpx;
  flex-shrink: 0;
}

.filter-options {
  display: flex;
  align-items: center;
  gap: 40rpx;
  flex: 1;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.filter-option text {
  font-size: 28rpx;
  color: #666;
}

/* 复选框样式 */
.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #1976d2;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background: #1976d2;
}

.check-icon {
  color: #fff;
  font-size: 24rpx;
}

/* 单选框样式 */
.radio {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #999;
  border-radius: 50%;
}

.radio.checked {
  border-color: #1976d2;
  background: #fff;
  position: relative;
}

.radio.checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 18rpx;
  height: 18rpx;
  background: #1976d2;
  border-radius: 50%;
}

/* 列表容器 */
.list-container {
  flex: 1;
  padding: 0 20rpx 20rpx;
  box-sizing: border-box;
}

/* 设备卡片 */
.equipment-card {
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.equipment-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.equipment-date {
  font-size: 24rpx;
  color: #999;
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
  align-items: flex-start;
}

.info-item.right {
  justify-content: flex-end;
}

.info-item.full {
  flex: none;
  width: 100%;
}

.info-label {
  font-size: 26rpx;
  color: #999;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 26rpx;
  color: #333;
}

.text-warning {
  color: #e53935;
}

.text-normal {
  color: #4caf50;
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

/* 覆盖 uni-nav-bar 标题样式 */
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
