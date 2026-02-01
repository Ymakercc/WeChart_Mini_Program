<template>
  <view class="page">
    <!-- 红色背景区域（带弧度） -->
    <view class="bg-area"></view>

    <!-- 主内容 -->
    <view class="main">
      <view class="logo-box">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
      </view>
      <view class="title">智慧消防设备管家</view>
      <view class="subtitle">守护安全每一刻</view>
    </view>

    <!--登录盒子-->
    <view class="login-box">
      <button class="btn" @click="handlePhoneLogin">
        手机号快捷登录 / 注册
      </button>

      <view class="pwd-text" @click="goPasswordLogin">
        已有账号？<text class="red">密码登录</text>
      </view>
    </view>
    <!-- 底部卡片 -->
    <view class="card">
      <view class="agree-box">
        <view class="agree-item" @tap="toggleAgreement">
          <view class="ck" :class="{ on: isAgreed }">
            <text v-if="isAgreed">✓</text>
          </view>
          <text>我已阅读并同意</text>
          <text class="red" @click.stop="openUserAgreement">《用户协议》</text>
          <text>和</text>
          <text class="red" @click.stop="openPrivacyPolicy">《隐私政策》</text>
        </view>

        <view class="agree-item" @tap="toggleNotify">
          <view class="rd" :class="{ on: acceptNotify }">
            <view v-if="acceptNotify" class="dot"></view>
          </view>
          <text>愿意接收相关安全通知和更新</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";

const isAgreed = ref(false);
const acceptNotify = ref(false);

const toggleAgreement = () => {
  isAgreed.value = !isAgreed.value;
};
const toggleNotify = () => {
  acceptNotify.value = !acceptNotify.value;
};

const handlePhoneLogin = () => {
  if (!isAgreed.value) {
    uni.showToast({ title: "请先同意用户协议", icon: "none" });
    return;
  }
  uni.navigateTo({ url: "/pages/login/register" });
};

const goPasswordLogin = () => {
  if (!isAgreed.value) {
    uni.showToast({ title: "请先同意用户协议", icon: "none" });
    return;
  }
  uni.navigateTo({ url: "/pages/login/password" });
};

const openUserAgreement = () => {
  uni.navigateTo({ url: "/pages/agreement/user" });
};
const openPrivacyPolicy = () => {
  uni.navigateTo({ url: "/pages/agreement/privacy" });
};
</script>

<style scoped>
.page {
  width: 100vw;
  height: 100vh;
  position: relative;
  background: #fff;
}

/* 红色背景区域 - 白色到红色渐变，底部弧形 */
.bg-area {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, #e6c7c7 0%, #f5a5a5 40%, #e53935 100%);
  border-radius: 0 0 50% 50% / 0 0 80rpx 80rpx;
}

.main {
  position: absolute;
  top: 260rpx;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.logo-box {
  width: 360rpx;
  height: 360rpx;
  /* background: #fff; */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15); */
}

.logo {
  width: 360rpx;
  height: 360rpx;
}

.title {
  margin-top: 24rpx;
  font-size: 64rpx;
  font-weight: bold;
  color: #fff;
}

.subtitle {
  margin-top: 12rpx;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
}

/* 登录盒子 */
.login-box {
  position: absolute;
  top: 55%;
  left: 30rpx;
  right: 30rpx;
  z-index: 3;
}

.card {
  position: absolute;
  bottom: 50rpx;
  left: 0;
  right: 0;
  padding: 0 30rpx;
  z-index: 2;
}

.btn {
  width: 100%;
  height: 84rpx;
  line-height: 84rpx;
  background: linear-gradient(90deg, #e53935, #ef5350);
  border-radius: 42rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 6rpx 16rpx rgba(229, 57, 53, 0.3);
}

.btn::after {
  border: none;
}

.pwd-text {
  text-align: center;
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #e53935;
}

.red {
  color: #e53935;
}

.agree-box {
  margin-top: 50rpx;
}

.agree-item {
  display: flex;
  align-items: center;
  margin-bottom: 14rpx;
  font-size: 22rpx;
  color: #666;
}

.ck {
  width: 26rpx;
  height: 26rpx;
  border: 2rpx solid #999;
  border-radius: 4rpx;
  margin-right: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18rpx;
  color: #fff;
}

.ck.on {
  background: #e53935;
  border-color: #e53935;
}

.rd {
  width: 26rpx;
  height: 26rpx;
  border: 2rpx solid #999;
  border-radius: 50%;
  margin-right: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rd.on {
  border-color: #e53935;
}

.dot {
  width: 14rpx;
  height: 14rpx;
  background: #e53935;
  border-radius: 50%;
}
</style>
