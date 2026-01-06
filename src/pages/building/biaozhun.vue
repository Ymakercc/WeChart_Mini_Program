<template>
  <view class="page">
    <view class="nav-header"></view>
    <view class="content">
      <view class="content-item"></view>
      <view class="footer">
        <view class="edit-btn" @tap="goEdit">
          <text class="edit-text">保存</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup></script>

<style scoped>
.page {
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}
.nav-header {
  height: 180rpx;
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
}
.content {
  flex: 1;
  height: calc(100vh - 180rpx);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 20rpx;
}
.content-item {
  flex: 1;
  background-color: blue;
}
.footer {
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.edit-btn {
  width: 80%;
  height: 90rpx;
  border-radius: 45rpx;
  background-color: #e53935;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
