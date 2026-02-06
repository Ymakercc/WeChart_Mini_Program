<template>
  <view class="page">
    <!-- 顶部横幅区域 -->
    <view class="banner">
      <view class="banner-content">
        <view class="banner-text">
          <text class="banner-title">智慧消防设备管家</text>
          <text class="banner-desc">提高工作效率 · 守护安全每一刻</text>
        </view>
        <image
          class="banner-img"
          src="/static/logo.png"
          mode="aspectFit"
        ></image>
      </view>

      <!-- 轮播图 -->
      <swiper
        class="swiper"
        circular
        autoplay
        :interval="3000"
        indicator-dots
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#fff"
      >
        <swiper-item v-for="(item, index) in bannerList" :key="index">
          <view class="swiper-slide" :style="{ background: item.color }">
            <text class="swiper-text">{{ item.title }}</text>
            <text class="swiper-desc">{{ item.desc }}</text>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 当前项目卡片 -->
    <view class="project-card">
      <view class="project-info">
        <text class="project-name">{{ projectName || "暂无项目" }}</text>
        <text class="project-addr">{{ projectAddr || "请选择项目" }}</text>
      </view>
      <view class="project-switch" @tap="switchProject">
        <text>切换</text>
      </view>
    </view>

    <!-- 我的应用 -->
    <view class="section">
      <text class="section-title">我的应用</text>
      <view class="app-grid">
        <view
          class="app-item"
          v-for="(item, index) in appList"
          :key="index"
          @tap="goPage(item.url)"
        >
          <view class="app-icon" :style="{ background: item.color }">
            <image
              class="app-icon-img"
              :src="item.icon"
              mode="aspectFit"
            ></image>
          </view>
          <text class="app-name">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 统计区域 -->
    <view class="stats-section">
      <view class="stats-card">
        <text class="stats-title">本月计划</text>
        <view class="stats-content">
          <text class="stats-num"
            >{{ monthPlan.done }}/{{ monthPlan.total }}</text
          >
          <text class="stats-label">已完成</text>
        </view>
      </view>
      <view class="stats-card">
        <text class="stats-title">设备状态</text>
        <view class="stats-content">
          <text class="stats-num stats-success">{{ deviceStats.normal }}</text>
          <text class="stats-label">正常运行</text>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>

    <!-- 底部导航 -->
    <TabBar :currentTab="0" />

    <!-- 公司选择抽屉 -->
    <CompanyDrawer
      :visible="showCompanyDrawer"
      :currentCompanyId="selectedCompany?.companyId"
      @close="showCompanyDrawer = false"
      @select="handleCompanySelect"
    />
  </view>
</template>

<script setup>
import api from "@/api/index";
import CompanyDrawer from "@/components/CompanyDrawer.vue";
import TabBar from "@/components/TabBar.vue";
import { onMounted, ref } from "vue";

const projectName = ref("");
const projectAddr = ref("");

// 控制公司选择抽屉显示
const showCompanyDrawer = ref(false);

// 当前选中的公司信息
const selectedCompany = ref(null);

const monthPlan = ref({
  done: 0,
  total: 0,
});

const deviceStats = ref({
  normal: 0,
  abnormal: 0,
});

// 轮播图数据（色块占位）
const bannerList = ref([
  {
    title: "消防安全月活动",
    desc: "全面提升消防安全意识",
    color: "linear-gradient(135deg, #ff6b6b, #ee5a5a)",
  },
  {
    title: "设备巡检提醒",
    desc: "本月已完成 80% 巡检任务",
    color: "linear-gradient(135deg, #4facfe, #00f2fe)",
  },
  {
    title: "培训通知",
    desc: "新员工消防培训即将开始",
    color: "linear-gradient(135deg, #43e97b, #38f9d7)",
  },
]);

// 应用列表 - 6个功能模块
const appList = ref([
  {
    name: "维保签到",
    icon: "/static/appIcon/sign_in.png",
    color: "#e53935",
    url: "/pages/checkin/index",
  },
  {
    name: "维保任务",
    icon: "/static/appIcon/task.png",
    color: "#fb8c00",
    url: "/pages/task/index",
  },
  {
    name: "巡查测试",
    icon: "/static/appIcon/test.png",
    color: "#43a047",
    url: "/pages/inspection/index",
  },
  {
    name: "设备信息",
    icon: "/static/appIcon/equipment.png",
    color: "#1e88e5",
    url: "/pages/equipment/index",
  },
  {
    name: "报告查询",
    icon: "/static/appIcon/report.png",
    color: "#8e24aa",
    url: "/pages/report/index",
  },
  {
    name: "建筑信息",
    icon: "/static/appIcon/architecture.png",
    color: "#00897b",
    url: "/pages/building/index",
  },
]);

const goPage = (url) => {
  // 已完成的页面可以跳转
  const enabledPages = [
    "/pages/building/index",
    "/pages/checkin/index",
    "/pages/equipment/index",
    "/pages/inspection/index",
    "/pages/task/index",
  ];
  if (enabledPages.includes(url)) {
    uni.navigateTo({ url });
  } else {
    uni.showToast({ title: "功能开发中...", icon: "none" });
  }
};

// 打开公司选择抽屉
const switchProject = () => {
  showCompanyDrawer.value = true;
};

// 处理公司选择
const handleCompanySelect = async (company) => {
  try {
    uni.showLoading({ title: "获取详情..." });
    const res = await api.getCompanyDetail(company.companyId);
    if ((res.code === 200 || res.code === 0) && res.data) {
      const data = res.data;
      selectedCompany.value = data;
      projectName.value = data.companyName || company.companyName;
      projectAddr.value = data.address || company.address;
    } else {
      // 接口返回错误时使用列表数据作为后备
      selectedCompany.value = company;
      projectName.value = company.companyName;
      projectAddr.value = company.address;
    }
  } catch (e) {
    console.error("获取公司详情失败:", e);
    // 失败时使用列表中的基础数据
    selectedCompany.value = company;
    projectName.value = company.companyName;
    projectAddr.value = company.address;
  } finally {
    uni.hideLoading();
  }
};

const loadData = async () => {
  try {
    // 获取首页数据
    const res = await api.getHomeStats();
    if (res.data) {
      // 只在没有选中公司时使用接口返回的项目信息
      if (!selectedCompany.value) {
        projectName.value = res.data.projectName || "消防设备管理项目";
        projectAddr.value = res.data.projectAddr || "默认地址";
      }
      monthPlan.value = res.data.monthPlan || { done: 0, total: 0 };
      deviceStats.value = res.data.deviceStats || { normal: 0, abnormal: 0 };
    }
  } catch (e) {
    // 使用默认数据
    if (!selectedCompany.value) {
      projectName.value = "消防设备管理项目";
      projectAddr.value = "项目地址";
    }
    monthPlan.value = { done: 0, total: 16 };
    deviceStats.value = { normal: 28, abnormal: 2 };
  }
};

// 加载当前选中的公司（从服务器会话中获取）
const loadCurrentCompany = async () => {
  try {
    const res = await api.getCurrentCompany();
    if ((res.code === 200 || res.code === 0) && res.data) {
      const data = res.data;
      selectedCompany.value = data;
      projectName.value = data.companyName || "暂无项目";
      projectAddr.value = data.address || "请选择项目";
    }
  } catch (e) {
    console.error("获取当前公司失败:", e);
  }
};

onMounted(() => {
  // 先加载当前选中的公司，再加载其他数据
  loadCurrentCompany();
  loadData();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 顶部横幅 */
.banner {
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  padding: 80rpx 30rpx 40rpx;
  padding-top: calc(80rpx + env(safe-area-inset-top));
  border-radius: 0 0 40rpx 40rpx;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-text {
  display: flex;
  flex-direction: column;
}

.banner-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}

.banner-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

.banner-img {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  padding: 10rpx;
}

/* 轮播图 */
.swiper {
  height: 200rpx;
  margin-top: 30rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.swiper-slide {
  height: 200rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 40rpx;
  border-radius: 16rpx;
}

.swiper-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}

.swiper-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 项目卡片 */
.project-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.project-info {
  flex: 1;
}

.project-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.project-addr {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.project-switch {
  padding: 12rpx 24rpx;
  background: rgba(229, 57, 53, 0.1);
  border-radius: 30rpx;
}

.project-switch text {
  font-size: 26rpx;
  color: #e53935;
}

/* 区块 */
.section {
  background: #fff;
  margin: 0 30rpx 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

/* 应用网格 */
.app-grid {
  display: flex;
  flex-wrap: wrap;
}

.app-item {
  width: 33.33%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}

.app-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.app-icon-img {
  width: 60rpx;
  height: 60rpx;
}

.app-name {
  font-size: 26rpx;
  color: #666;
}

/* 统计区域 */
.stats-section {
  display: flex;
  gap: 20rpx;
  margin: 0 30rpx 30rpx;
}

.stats-card {
  flex: 1;
  background: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
}

.stats-title {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.stats-content {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.stats-num {
  font-size: 48rpx;
  font-weight: bold;
  color: #e53935;
}

.stats-num.stats-success {
  color: #43a047;
}

.stats-label {
  font-size: 24rpx;
  color: #999;
}

/* 底部占位 */
.bottom-placeholder {
  height: 120rpx;
}
</style>
