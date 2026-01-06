<template>
  <view class="page">
    <!-- 顶部装饰 -->
    <view class="top-deco"></view>

    <!-- 标题区域 -->
    <view class="header-box">
      <text class="title">欢迎回来</text>
      <text class="desc">请使用手机号和密码登录</text>
    </view>

    <!-- 表单区域 -->
    <view class="form-box">
      <!-- 手机号 -->
      <view class="input-group">
        <view class="input-icon">📱</view>
        <input
          class="input"
          type="number"
          v-model="phone"
          placeholder="请输入手机号"
          maxlength="11"
        />
        <view class="clear-btn" v-if="phone" @tap="phone = ''">✕</view>
      </view>

      <!-- 密码 -->
      <view class="input-group">
        <view class="input-icon">🔒</view>
        <input
          class="input"
          :type="showPwd ? 'text' : 'password'"
          v-model="password"
          placeholder="请输入密码"
        />
        <view class="eye-btn" @tap="showPwd = !showPwd">
          {{ showPwd ? "👁" : "👁‍🗨" }}
        </view>
      </view>

      <!-- 忘记密码 -->
      <view class="forgot" @tap="handleForgot">忘记密码？</view>

      <!-- 登录按钮 -->
      <button
        class="submit-btn"
        :class="{ active: canSubmit }"
        @tap="handleLogin"
      >
        登 录
      </button>

      <!-- 注册入口 -->
      <view class="register-link">
        <text>还没有账号？</text>
        <text class="link" @tap="goRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { setToken } from "@/utils/request";
import { computed, ref } from "vue";

const phone = ref("");
const password = ref("");
const showPwd = ref(false);

const canSubmit = computed(
  () => phone.value.length === 11 && password.value.length >= 6
);

const handleForgot = () => {
  uni.showToast({ title: "请联系管理员重置密码", icon: "none" });
};

const goRegister = () => {
  uni.navigateTo({ url: "/pages/login/register" });
};

const handleLogin = async () => {
  if (!canSubmit.value) {
    uni.showToast({ title: "请输入完整信息", icon: "none" });
    return;
  }

  uni.showLoading({ title: "登录中...", mask: true });

  try {
    const res = await api.login({
      username: phone.value,
      password: password.value,
    });

    uni.hideLoading();

    // 新接口返回的 token 在 res.data 中
    if (res.data && res.data.token) {
      setToken(res.data.token);
    }

    uni.showToast({ title: "登录成功", icon: "success" });
    setTimeout(() => {
      uni.reLaunch({ url: "/pages/index/index" });
    }, 1500);
  } catch (e) {
    uni.hideLoading();
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #fff;
}

.top-deco {
  height: 400rpx;
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  border-radius: 0 0 0 100rpx;
}

/* 标题区域 */
.header-box {
  padding: 0 50rpx;
  margin-top: -280rpx;
  margin-bottom: 40rpx;
}

.title {
  display: block;
  font-size: 52rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12rpx;
}

.desc {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

/* 表单区域 */
.form-box {
  background: #fff;
  padding: 30rpx 40rpx 50rpx;
  margin: 0 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.input-group {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #eee;
  padding: 30rpx 0;
}

.input-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
  width: 50rpx;
}

.input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.clear-btn,
.eye-btn {
  font-size: 32rpx;
  padding: 10rpx;
  color: #999;
}

.forgot {
  text-align: right;
  font-size: 26rpx;
  color: #e53935;
  margin: 20rpx 0 40rpx;
}

.submit-btn {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  background: #ccc;
  border-radius: 46rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
}

.submit-btn.active {
  background: linear-gradient(90deg, #e53935, #ef5350);
  box-shadow: 0 8rpx 20rpx rgba(229, 57, 53, 0.3);
}

.submit-btn::after {
  border: none;
}

.register-link {
  text-align: center;
  margin-top: 30rpx;
  font-size: 26rpx;
  color: #666;
}

.register-link .link {
  color: #e53935;
  margin-left: 10rpx;
}
</style>
