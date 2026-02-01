<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">签到历史</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 列表区域 -->
    <scroll-view class="history-list" scroll-y @scrolltolower="loadMore">
      <view
        class="history-item"
        v-for="(item, index) in historyList"
        :key="index"
      >
        <view class="item-main">
          <view
            class="type-tag"
            :class="item.checkInType === '0' ? 'in' : 'out'"
          >
            {{ item.checkInType === "0" ? "签到" : "签退" }}
          </view>
          <text class="item-time">{{
            formatTime(item.checkInTime || item.createTime)
          }}</text>
        </view>

        <view class="item-detail">
          <view class="detail-row">
            <text class="label">公司</text>
            <text class="value">{{ item.companyName || "当前项目" }}</text>
          </view>
          <view class="detail-row">
            <text class="label">地址</text>
            <text class="value">{{ item.address || "-" }}</text>
          </view>
          <view class="detail-row" v-if="item.remark">
            <text class="label">备注</text>
            <text class="value">{{ item.remark }}</text>
          </view>
        </view>

        <view class="item-images" v-if="item.imageUrls">
          <image
            v-for="(img, idx) in splitImages(item.imageUrls)"
            :key="idx"
            :src="getFullUrl(img)"
            mode="aspectFill"
            @tap="previewImage(item.imageUrls, img)"
          ></image>
        </view>
      </view>

      <!-- 加载提示 -->
      <view class="load-more">
        <text v-if="loading">加载中...</text>
        <text v-else-if="noMore">没有更多了</text>
        <text v-else-if="historyList.length === 0">暂无记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import api, { BASE_URL } from "@/api/index";
import { onMounted, ref } from "vue";

const historyList = ref([]);
const pageNum = ref(1);
const pageSize = 10;
const loading = ref(false);
const noMore = ref(false);

const goBack = () => {
  uni.navigateBack();
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  if (typeof timeStr !== "string") return String(timeStr);
  return timeStr.substring(0, 19).replace("T", " ");
};

const splitImages = (urls) => {
  if (!urls) return [];
  return urls.split(",").filter((i) => !!i);
};

const getFullUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return BASE_URL + url;
};

const previewImage = (allUrls, currentUrl) => {
  const urls = splitImages(allUrls).map((i) => getFullUrl(i));
  uni.previewImage({
    urls: urls,
    current: getFullUrl(currentUrl),
  });
};

const loadHistory = async () => {
  if (loading.value || noMore.value) return;

  loading.value = true;
  try {
    const res = await api.getCheckInList({
      pageNum: pageNum.value,
      pageSize: pageSize,
    });

    if (res && (res.code === 200 || res.code === 0)) {
      const rows = res.rows || res.data || [];
      if (rows.length < pageSize) {
        noMore.value = true;
      }
      historyList.value = [...historyList.value, ...rows];
      pageNum.value++;
    }
  } catch (e) {
    console.error("获取历史记录失败", e);
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  loadHistory();
};

onMounted(() => {
  loadHistory();
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

.history-list {
  flex: 1;
  padding: 20rpx;
  box-sizing: border-box;
}

.history-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.type-tag {
  padding: 6rpx 20rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.type-tag.in {
  background: rgba(30, 136, 229, 0.1);
  color: #1e88e5;
}

.type-tag.out {
  background: rgba(239, 83, 80, 0.1);
  color: #ef5350;
}

.item-time {
  font-size: 24rpx;
  color: #999;
}

.item-detail {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.detail-row {
  display: flex;
}

.label {
  width: 100rpx;
  font-size: 26rpx;
  color: #999;
  flex-shrink: 0;
}

.value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  line-height: 1.4;
}

.item-images {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.item-images image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 8rpx;
}

.load-more {
  text-align: center;
  padding: 40rpx 0;
}

.load-more text {
  font-size: 24rpx;
  color: #999;
}
</style>
