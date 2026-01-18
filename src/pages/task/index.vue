<template>
  <view class="page">
    <!-- 导航栏 -->
    <uni-nav-bar
      fixed
      status-bar
      left-icon="back"
      title="维保任务"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!-- 内容区域 -->
    <view class="content">
      <!-- Tab 切换 -->
      <view class="tab-wrapper">
        <view
          class="tab-item"
          :class="{ active: activeTab === 'periodic' }"
          @tap="switchTab('periodic')"
        >
          <text>周期任务</text>
          <view class="tab-line" v-if="activeTab === 'periodic'"></view>
        </view>
        <view
          class="tab-item"
          :class="{ active: activeTab === 'temporary' }"
          @tap="switchTab('temporary')"
        >
          <text>临时任务</text>
          <view class="tab-line" v-if="activeTab === 'temporary'"></view>
        </view>
      </view>

      <!-- 任务列表 -->
      <scroll-view class="task-list" scroll-y @scrolltolower="loadMore">
        <view
          class="task-card"
          v-for="item in taskList"
          :key="item.taskId"
          @tap="goTaskDetail(item)"
        >
          <!-- 任务标题 -->
          <view class="task-title">{{ item.taskName || "维保任务" }}</view>

          <!-- 任务信息 -->
          <view class="task-info">
            <text class="info-text"
              >项目负责人 {{ item.managerName || "-" }}
              {{ item.managerPhone || "" }}</text
            >
          </view>
          <view class="task-info">
            <text class="info-text"
              >维保操作员 {{ item.operatorNames || "-" }}</text
            >
          </view>

          <!-- 任务状态 -->
          <view class="task-status" :class="getStatusClass(item.status)">
            <text>{{ getStatusText(item.status) }}</text>
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="loading-more" v-if="loading">
          <text>加载中...</text>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="taskList.length === 0 && !loading">
          <text class="empty-text">暂无任务</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { onMounted, ref } from "vue";

const activeTab = ref("periodic"); // periodic: 周期任务, temporary: 临时任务
const taskList = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 切换 Tab
const switchTab = (tab) => {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  pageNum.value = 1;
  taskList.value = [];
  hasMore.value = true;
  loadTaskList();
};

// 获取当月的开始和结束日期
const getCurrentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // 当月第一天
  const firstDay = new Date(year, month, 1);
  // 当月最后一天
  const lastDay = new Date(year, month + 1, 0);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  return {
    beginTime: formatDate(firstDay),
    endTime: formatDate(lastDay),
  };
};

// 加载任务列表
const loadTaskList = async () => {
  if (loading.value || !hasMore.value) return;

  try {
    loading.value = true;
    const companyId = uni.getStorageSync("selectedCompanyId");
    if (!companyId) {
      uni.showToast({ title: "请先选择公司", icon: "none" });
      return;
    }

    const { beginTime, endTime } = getCurrentMonthRange();

    const res = await api.getMyTaskList({
      companyId: companyId,
      status: "",
      taskType: activeTab.value === "periodic" ? "0" : "1", // 0: 周期任务, 1: 临时任务
      params: {
        beginTime: beginTime,
        endTime: endTime,
      },
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    });

    if (res.code === 200 || res.code === 0) {
      const rows = res.rows || res.data?.rows || [];
      if (pageNum.value === 1) {
        taskList.value = rows;
      } else {
        taskList.value = [...taskList.value, ...rows];
      }

      // 判断是否还有更多
      hasMore.value = rows.length >= pageSize.value;
    }
  } catch (e) {
    console.error("获取任务列表失败:", e);
    uni.showToast({ title: "获取任务列表失败", icon: "none" });
  } finally {
    loading.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    pageNum.value++;
    loadTaskList();
  }
};

// 跳转到任务详情
const goTaskDetail = (item) => {
  uni.setStorageSync("currentTask", item);
  uni.navigateTo({
    url: `/pages/task/detail?id=${item.taskId}`,
  });
};

// 获取状态样式类
const getStatusClass = (status) => {
  const statusMap = {
    0: "status-pending", // 待执行
    1: "status-running", // 执行中
    2: "status-completed", // 已完成
    3: "status-overdue", // 已逾期
  };
  return statusMap[status] || "status-pending";
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: "待执行",
    1: "执行中",
    2: "已完成",
    3: "已逾期",
  };
  return statusMap[status] || "待执行";
};

onMounted(() => {
  loadTaskList();
});
</script>

<style scoped>
.page {
  width: 100vw;
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 内容区域 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: calc(16px + env(safe-area-inset-top));
  overflow: hidden;
}

/* Tab 切换 */
.tab-wrapper {
  display: flex;
  background: #fff;
  padding: 0 30rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0;
  position: relative;
}

.tab-item text {
  font-size: 30rpx;
  color: #666;
}

.tab-item.active text {
  color: #e53935;
  font-weight: bold;
}

.tab-line {
  position: absolute;
  bottom: 0;
  width: 80rpx;
  height: 6rpx;
  background: #e53935;
  border-radius: 3rpx;
}

/* 任务列表 */
.task-list {
  flex: 1;
  padding: 20rpx;
}

/* 任务卡片 */
.task-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  position: relative;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.task-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  padding-right: 120rpx;
}

.task-info {
  margin-bottom: 12rpx;
}

.info-text {
  font-size: 26rpx;
  color: #666;
}

/* 任务状态 */
.task-status {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.task-status text {
  font-size: 24rpx;
}

.status-pending {
  background: rgba(158, 158, 158, 0.1);
}

.status-pending text {
  color: #9e9e9e;
}

.status-running {
  background: rgba(255, 152, 0, 0.1);
}

.status-running text {
  color: #ff9800;
}

.status-completed {
  background: rgba(76, 175, 80, 0.1);
}

.status-completed text {
  color: #4caf50;
}

.status-overdue {
  background: rgba(244, 67, 54, 0.1);
}

.status-overdue text {
  color: #f44336;
}

/* 加载更多 */
.loading-more {
  text-align: center;
  padding: 30rpx;
}

.loading-more text {
  font-size: 26rpx;
  color: #999;
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
