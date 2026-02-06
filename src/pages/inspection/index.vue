<template>
  <view class="page">
    <!-- 导航栏 -->
    <uni-nav-bar
      fixed
      status-bar
      left-icon="back"
      title="巡检管理"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!-- 内容区域 -->
    <view class="content">
      <!-- 搜索栏 -->
      <view class="search-bar">
        <uni-search-bar
          v-model="searchKeyword"
          placeholder="请输入关键字"
          cancelButton="none"
          @confirm="handleSearch"
          @clear="handleClear"
        />
        <view class="date-picker" @tap="openDatePicker">
          <uni-icons type="calendar" size="24" color="#666" />
        </view>
      </view>

      <!-- 列表区域 -->
      <scroll-view class="list-container" scroll-y @scrolltolower="loadMore">
        <view
          class="inspection-card"
          v-for="item in inspectionList"
          :key="item.inspectionId"
          @tap="goDetail(item)"
        >
          <view class="card-header">
            <view class="title-row">
              <text class="title">{{
                item.equipmentName || item.equipmentType
              }}</text>
              <text class="tag" v-if="item.inspectionType"
                >({{ item.inspectionTypeName || "测试" }})</text
              >
            </view>
            <text class="date">{{
              formatDate(item.inspectionDate || item.createTime)
            }}</text>
          </view>

          <view class="card-content">
            <view class="info-row">
              <text class="label">巡查人员</text>
              <text class="value">{{
                item.inspectorName || item.createBy
              }}</text>
              <text class="count"
                >数量 {{ item.quantity || item.equipmentCount || 1 }}</text
              >
            </view>
            <view class="info-row">
              <text class="label">具体位置</text>
              <text class="value">{{ item.location || "-" }}</text>
              <view class="status-badge" :class="getStatusClass(item.status)">
                {{ item.statusName || getStatusText(item.status) }}
              </view>
            </view>
            <view class="info-row">
              <text class="label">所在建筑</text>
              <text class="value">{{ item.buildingName || "-" }}</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view
          class="empty-state"
          v-if="inspectionList.length === 0 && !loading"
        >
          <text class="empty-text">暂无数据</text>
        </view>

        <!-- 加载状态 -->
        <view class="loading-more" v-if="loading">
          <text>加载中...</text>
        </view>

        <view class="no-more" v-if="noMore && inspectionList.length > 0">
          <text>没有更多了</text>
        </view>
      </scroll-view>
    </view>

    <!-- 新增按钮 -->
    <uni-fab
      :pattern="fabPattern"
      :horizontal="'right'"
      :vertical="'bottom'"
      @fabClick="goAdd"
    />

    <!-- 日期选择器 -->
    <uni-popup ref="datePopup" type="bottom">
      <view class="date-popup">
        <view class="popup-header">
          <text @tap="closeDatePicker">取消</text>
          <text class="popup-title">选择日期</text>
          <text @tap="confirmDate">确定</text>
        </view>
        <picker-view
          :value="dateValue"
          @change="onDateChange"
          class="picker-view"
        >
          <picker-view-column>
            <view class="picker-item" v-for="year in years" :key="year"
              >{{ year }}年</view
            >
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="month in months" :key="month"
              >{{ month }}月</view
            >
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="day in days" :key="day"
              >{{ day }}日</view
            >
          </picker-view-column>
        </picker-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { computed, onMounted, onUnmounted, ref } from "vue";

const searchKeyword = ref("");
const inspectionList = ref([]);
const loading = ref(false);
const noMore = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const currentCompanyId = ref(null);

const datePopup = ref(null);
const selectedDate = ref("");
const dateValue = ref([5, 0, 0]); // 默认选中当前年（第6个）、第1月、第1天

// 生成年份和月份选项
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

// 根据选择的年月动态计算天数
const days = computed(() => {
  const yearIndex = dateValue.value[0] || 0;
  const monthIndex = dateValue.value[1] || 0;
  const year = years[yearIndex];
  const month = months[monthIndex];
  // 获取该月的天数
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
});

// FAB 按钮样式
const fabPattern = ref({
  color: "#fff",
  backgroundColor: "#e53935",
  selectedColor: "#fff",
  buttonColor: "#e53935",
});

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 跳转详情
const goDetail = (item) => {
  uni.navigateTo({
    url: `/pages/inspection/detail?id=${item.inspectionId}`,
  });
};

// 跳转新增
const goAdd = () => {
  uni.navigateTo({
    url: "/pages/inspection/form",
  });
};

// 搜索
const handleSearch = () => {
  pageNum.value = 1;
  noMore.value = false;
  inspectionList.value = [];
  loadList();
};

// 清空搜索
const handleClear = () => {
  searchKeyword.value = "";
  handleSearch();
};

// 加载当前选中的公司
const loadCurrentCompany = async () => {
  try {
    const res = await api.getCurrentCompany();
    if ((res.code === 200 || res.code === 0) && res.data) {
      currentCompanyId.value = res.data.companyId;
      return res.data.companyId;
    }
  } catch (e) {
    console.error("获取当前公司失败:", e);
  }
  return null;
};

// 加载列表
const loadList = async () => {
  if (loading.value || noMore.value) return;

  try {
    loading.value = true;

    if (!currentCompanyId.value) {
      await loadCurrentCompany();
    }

    const res = await api.getMyInspectionList({
      companyId: currentCompanyId.value,
      keyword: searchKeyword.value,
      inspectionDate: selectedDate.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    });

    if (res.code === 200 || res.code === 0) {
      const data = res.rows || res.data || [];
      if (pageNum.value === 1) {
        inspectionList.value = data;
      } else {
        inspectionList.value = [...inspectionList.value, ...data];
      }

      if (data.length < pageSize.value) {
        noMore.value = true;
      }
    }
  } catch (e) {
    console.error("获取巡检列表失败", e);
    uni.showToast({ title: "获取数据失败", icon: "none" });
  } finally {
    loading.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (!noMore.value && !loading.value) {
    pageNum.value++;
    loadList();
  }
};

// 日期变化
const onDateChange = (e) => {
  dateValue.value = e.detail.value;
};

// 打开日期选择器
const openDatePicker = () => {
  datePopup.value.open();
};

// 关闭日期选择器
const closeDatePicker = () => {
  datePopup.value.close();
};

// 确认日期
const confirmDate = () => {
  const year = years[dateValue.value[0]];
  const month = String(months[dateValue.value[1]]).padStart(2, "0");
  const day = String((dateValue.value[2] || 0) + 1).padStart(2, "0");
  selectedDate.value = `${year}-${month}-${day}`;
  datePopup.value.close();
  handleSearch();
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
};

// 获取状态样式
const getStatusClass = (status) => {
  switch (String(status)) {
    case "0":
    case "正常":
      return "status-normal";
    case "1":
    case "异常":
      return "status-error";
    default:
      return "status-normal";
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (String(status)) {
    case "0":
      return "正常";
    case "1":
      return "异常";
    default:
      return "正常";
  }
};

// 刷新列表
const refreshList = () => {
  pageNum.value = 1;
  noMore.value = false;
  inspectionList.value = [];
  loadList();
};

onMounted(async () => {
  await loadCurrentCompany();
  loadList();
  // 监听刷新事件
  uni.$on("refreshInspectionList", refreshList);
});

onUnmounted(() => {
  // 移除事件监听
  uni.$off("refreshInspectionList", refreshList);
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
  display: flex;
  flex-direction: column;
  padding-top: calc(14px + env(safe-area-inset-top));
}

/* 搜索栏 */
.search-bar {
  display: flex;
  /* width: 94%; */
  align-items: center;
  background: #fff;
  padding: 16rpx 20rpx;
  gap: 16rpx;
}

.search-bar :deep(.uni-searchbar) {
  flex: 1;
  padding: 0;
}

.search-bar :deep(.uni-searchbar__box) {
  background: #f5f5f5;
  border-radius: 40rpx;
}

.date-picker {
  width: 80rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12rpx;
}

/* 列表容器 */
.list-container {
  flex: 1;
  width: 100%;
  padding: 20rpx;
  padding-right: 20rpx;
  box-sizing: border-box;
}

/* 卡片样式 */
.inspection-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.tag {
  font-size: 24rpx;
  color: #999;
}

.date {
  font-size: 24rpx;
  color: #999;
}

.card-content {
  padding: 20rpx 24rpx;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
}

.label {
  width: 140rpx;
  font-size: 26rpx;
  color: #999;
  flex-shrink: 0;
}

.value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.count {
  font-size: 26rpx;
  color: #333;
  margin-left: 20rpx;
}

.status-badge {
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.status-normal {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.status-error {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
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

/* 加载更多 */
.loading-more,
.no-more {
  text-align: center;
  padding: 30rpx 0;
}

.loading-more text,
.no-more text {
  font-size: 26rpx;
  color: #999;
}

/* 日期弹窗 */
.date-popup {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}

.popup-header text {
  font-size: 28rpx;
  color: #e53935;
}

.popup-title {
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
