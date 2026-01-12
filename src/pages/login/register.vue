<template>
  <view class="page">
    <!-- 顶部装饰 -->
    <view class="top-deco"></view>

    <!-- 标题区域 -->
    <view class="header-box">
      <text class="title">注册账号</text>
      <text class="desc">请填写以下信息完成注册</text>
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
          placeholder="请输入手机号（作为登录账号）"
          maxlength="11"
        />
      </view>

      <!-- 姓名 -->
      <view class="input-group">
        <view class="input-icon">👤</view>
        <input
          class="input"
          type="text"
          v-model="nickName"
          placeholder="请输入您的姓名"
        />
      </view>

      <!-- 密码 -->
      <view class="input-group">
        <view class="input-icon">🔒</view>
        <input
          class="input"
          :type="showPwd ? 'text' : 'password'"
          v-model="password"
          placeholder="请设置密码（6位以上）"
        />
        <view class="eye-btn" @tap="showPwd = !showPwd">
          {{ showPwd ? "👁" : "👁‍🗨" }}
        </view>
      </view>

      <!-- 确认密码 -->
      <view class="input-group">
        <view class="input-icon">🔐</view>
        <input
          class="input"
          :type="showPwd2 ? 'text' : 'password'"
          v-model="confirmPwd"
          placeholder="请再次输入密码"
        />
        <view class="eye-btn" @tap="showPwd2 = !showPwd2">
          {{ showPwd2 ? "👁" : "👁‍🗨" }}
        </view>
      </view>

      <!-- 注册按钮 -->
      <button
        class="submit-btn"
        :class="{ active: canSubmit }"
        @tap="handleRegister"
      >
        注 册
      </button>

      <!-- 登录入口 -->
      <view class="login-link">
        <text>已有账号？</text>
        <text class="link" @tap="goLogin">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { computed, ref } from "vue";

const phone = ref("");
const nickName = ref("");
const password = ref("");
const confirmPwd = ref("");
const showPwd = ref(false);
const showPwd2 = ref(false);

const canSubmit = computed(() => {
  return (
    phone.value.length === 11 &&
    nickName.value.length > 0 &&
    password.value.length >= 6 &&
    confirmPwd.value.length >= 6
  );
});

const goLogin = () => {
  uni.navigateTo({ url: "/pages/login/password" });
};

const handleRegister = async () => {
  if (!canSubmit.value) {
    console.log(canSubmit.value);

    uni.showToast({ title: "请填写完整信息", icon: "none" });
    return;
  }

  if (password.value !== confirmPwd.value) {
    uni.showToast({ title: "两次输入的密码不一致", icon: "none" });
    return;
  }

  uni.showLoading({ title: "注册中...", mask: true });

  try {
    // 调用注册接口
    const res = await api.register({
      loginName: phone.value, // 登录账号（手机号）
      userName: nickName.value, // 用户昵称（姓名）
      phonenumber: phone.value, // 手机号码
      password: password.value, // 密码
    });

    if (res.code === 200 || res.code === 0) {
      uni.hideLoading();
      uni.showToast({ title: "注册成功", icon: "success" });

      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      uni.hideLoading();
      uni.showToast({ title: res.msg || "注册失败", icon: "none" });
    }
  } catch (e) {
    uni.hideLoading();
    console.error("Register Error:", e);
    uni.showToast({
      title: e.msg || e.errMsg || "注册失败，请检查网络",
      icon: "none",
    });
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
  border-radius: 0 0 100rpx 0;
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
  padding: 28rpx 0;
}

.input-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  width: 50rpx;
}

.input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.eye-btn {
  font-size: 32rpx;
  padding: 10rpx;
  color: #999;
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
  margin-top: 50rpx;
}

.submit-btn.active {
  background: linear-gradient(90deg, #e53935, #ef5350);
  box-shadow: 0 8rpx 20rpx rgba(229, 57, 53, 0.3);
}

.submit-btn::after {
  border: none;
}

.login-link {
  text-align: center;
  margin-top: 30rpx;
  font-size: 26rpx;
  color: #666;
}

.login-link .link {
  color: #e53935;
  margin-left: 10rpx;
}
</style>
