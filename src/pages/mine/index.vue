<template>
  <view class="page">
    <!-- 顶部用户信息 -->
    <view class="header">
      <view class="user-info">
        <view class="avatar">
          <text class="avatar-text">{{
            userInfo.userName ? userInfo.userName.charAt(0) : "用"
          }}</text>
        </view>
        <view class="user-detail">
          <text class="user-name">{{ userInfo.userName || "未登录" }}</text>
          <text class="user-phone">{{ userInfo.loginName || "" }}</text>
        </view>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <view class="menu-item" @tap="goPage('/pages/profile/index')">
        <text class="menu-icon">👤</text>
        <text class="menu-title">个人资料</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goPage('/pages/settings/index')">
        <text class="menu-icon">⚙</text>
        <text class="menu-title">设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="goPage('/pages/about/index')">
        <text class="menu-icon">ℹ</text>
        <text class="menu-title">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @tap="handleLogout">退出登录</button>
    </view>

    <view class="bottom-placeholder"></view>
    <TabBar :currentTab="3" />
  </view>
</template>

<script setup>
import api from "@/api/index";
import TabBar from "@/components/TabBar.vue";
import { removeToken } from "@/utils/request";
import { onMounted, ref } from "vue";

const userInfo = ref({
  userName: "",
  loginName: "",
  phonenumber: "",
});

const goPage = (url) => {
  uni.showToast({ title: "功能开发中...", icon: "none" });
};

const handleLogout = () => {
  uni.showModal({
    title: "提示",
    content: "确定要退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        removeToken();
        uni.reLaunch({ url: "/pages/login/index" });
      }
    },
  });
};

const loadUserInfo = async () => {
  try {
    const res = await api.getUserInfo();
    if (res.data) {
      userInfo.value = res.data;
    }
  } catch (e) {
    // 使用存储的信息或默认
  }
};

onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  padding: 80rpx 30rpx 60rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.avatar-text {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.user-phone {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

/* 菜单 */
.menu-section {
  background: #fff;
  margin: 30rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-title {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #ccc;
}

/* 退出登录 */
.logout-section {
  margin: 30rpx;
}

.logout-btn {
  background: #fff;
  color: #e53935;
  font-size: 32rpx;
  padding: 28rpx 0;
  border-radius: 16rpx;
  border: none;
}

.logout-btn::after {
  border: none;
}

.bottom-placeholder {
  height: 120rpx;
}
</style>
