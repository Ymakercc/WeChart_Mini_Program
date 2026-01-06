<template>
  <view class="phone-login-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text>←</text>
      </view>
      <view class="header-title">手机号登录</view>
      <view class="placeholder"></view>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <view class="form-title">欢迎使用智慧消防设备管家</view>
      <view class="form-subtitle">请输入您的手机号进行登录或注册</view>

      <!-- 手机号输入 -->
      <view class="input-group">
        <view class="input-prefix">+86</view>
        <input
          class="input-field"
          type="number"
          v-model="phone"
          placeholder="请输入手机号"
          maxlength="11"
        />
        <view class="clear-btn" v-if="phone" @click="phone = ''">×</view>
      </view>

      <!-- 验证码输入 -->
      <view class="input-group">
        <input
          class="input-field code-input"
          type="number"
          v-model="code"
          placeholder="请输入验证码"
          maxlength="6"
        />
        <view
          class="code-btn"
          :class="{ disabled: countdown > 0 }"
          @click="sendCode"
        >
          {{ countdown > 0 ? `${countdown}s后重发` : "获取验证码" }}
        </view>
      </view>

      <!-- 登录按钮 -->
      <button
        class="submit-btn"
        :class="{ active: canSubmit }"
        :disabled="!canSubmit"
        @click="handleLogin"
      >
        登录 / 注册
      </button>

      <!-- 提示文字 -->
      <view class="tips"> 未注册的手机号将自动创建账号 </view>
    </view>
  </view>
</template>

<script setup>
import { setToken } from "@/utils/request";
import { computed, ref } from "vue";

const phone = ref("");
const code = ref("");
const countdown = ref(0);
let timer = null;

// 是否可以提交
const canSubmit = computed(() => {
  return phone.value.length === 11 && code.value.length >= 4;
});

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 发送验证码
const sendCode = () => {
  if (countdown.value > 0) return;

  if (phone.value.length !== 11) {
    uni.showToast({
      title: "请输入正确的手机号",
      icon: "none",
    });
    return;
  }

  // TODO: 调用发送验证码接口
  uni.showToast({
    title: "验证码已发送",
    icon: "success",
  });

  // 开始倒计时
  countdown.value = 60;
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

// 登录
const handleLogin = async () => {
  if (!canSubmit.value) return;

  uni.showLoading({ title: "登录中...", mask: true });

  try {
    // TODO: 调用手机号登录接口
    // const res = await api.phoneLogin({ phone: phone.value, code: code.value })

    // 模拟登录成功
    setTimeout(() => {
      uni.hideLoading();

      // 保存 Token
      setToken("mock_token_xxx");

      uni.showToast({
        title: "登录成功",
        icon: "success",
      });

      // 跳转到首页
      setTimeout(() => {
        uni.reLaunch({
          url: "/pages/index/index",
        });
      }, 1500);
    }, 1000);
  } catch (e) {
    uni.hideLoading();
    uni.showToast({
      title: e.msg || "登录失败",
      icon: "none",
    });
  }
};
</script>

<style scoped>
.phone-login-container {
  min-height: 100vh;
  background: #fff;
}

/* 顶部导航 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  padding-top: calc(20rpx + env(safe-area-inset-top));
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #333;
}

.header-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.placeholder {
  width: 60rpx;
}

/* 表单区域 */
.form-section {
  padding: 60rpx 50rpx;
}

.form-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.form-subtitle {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 80rpx;
}

/* 输入框组 */
.input-group {
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #eee;
  padding: 30rpx 0;
  margin-bottom: 20rpx;
}

.input-prefix {
  font-size: 32rpx;
  color: #333;
  padding-right: 20rpx;
  border-right: 2rpx solid #eee;
  margin-right: 20rpx;
}

.input-field {
  flex: 1;
  font-size: 32rpx;
  color: #333;
}

.code-input {
  margin-right: 20rpx;
}

.clear-btn {
  width: 40rpx;
  height: 40rpx;
  background: #ccc;
  border-radius: 50%;
  color: #fff;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-btn {
  font-size: 28rpx;
  color: #e53935;
  white-space: nowrap;
}

.code-btn.disabled {
  color: #999;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 100rpx;
  background: #ccc;
  border-radius: 50rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin-top: 60rpx;
}

.submit-btn.active {
  background: linear-gradient(90deg, #e53935 0%, #ef5350 100%);
  box-shadow: 0 8rpx 24rpx rgba(229, 57, 53, 0.35);
}

.submit-btn::after {
  border: none;
}

/* 提示文字 */
.tips {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  margin-top: 30rpx;
}
</style>
