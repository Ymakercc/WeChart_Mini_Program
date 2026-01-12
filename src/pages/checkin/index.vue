<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">维保签到</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 地图区域 -->
    <view class="map-container">
      <map
        id="checkInMap"
        class="map"
        :latitude="latitude"
        :longitude="longitude"
        :markers="markers"
        show-location
      ></map>
    </view>

    <!-- 位置信息与操作区 -->
    <view class="content-panel">
      <!-- 公司名称 -->
      <view class="company-info" v-if="selectedCompanyName">
        <text class="company-name">{{ selectedCompanyName }}</text>
      </view>

      <!-- 当前位置 -->
      <view class="location-box">
        <view class="location-main">
          <image
            class="location-icon"
            src="/static/tabbar/info.png"
            mode="aspectFit"
          ></image>
          <text class="location-text">{{
            currentAddress || "正在获取位置..."
          }}</text>
        </view>
        <view class="refresh-btn" @tap="getLocation">
          <!-- 使用文字代替缺失的刷新图标 -->
          <text class="refresh-text">刷新</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-btns">
        <view class="btn check-in" @tap="openDrawer('0')">
          <text class="btn-text">签到</text>
        </view>
        <view class="btn check-out" @tap="openDrawer('1')">
          <text class="btn-text">签退</text>
        </view>
      </view>

      <!-- 最近记录 -->
      <view class="history-preview">
        <view
          class="preview-item"
          v-for="(item, index) in recentList"
          :key="index"
        >
          <view
            class="item-dot"
            :class="item.checkInType === '0' ? 'in' : 'out'"
          ></view>
          <view class="item-content">
            <view class="item-header">
              <text class="item-type">{{
                item.checkInType === "0" ? "签到" : "签退"
              }}</text>
              <text class="item-time">{{
                formatTime(item.checkInTime || item.createTime)
              }}</text>
            </view>
            <view class="item-addr">
              <text class="addr-text">{{ item.checkInAddress }}</text>
            </view>
          </view>
        </view>
        <view class="view-history" @tap="goHistory">
          <text>签到历史 >></text>
        </view>
      </view>
    </view>

    <!-- 签到/签退 抽屉 -->
    <view class="drawer-mask" v-if="showDrawer" @tap="closeDrawer">
      <view class="drawer-content" @tap.stop>
        <view class="drawer-header">
          <text class="drawer-title">{{
            checkType === "0" ? "签到确认" : "签退确认"
          }}</text>
          <text class="drawer-close" @tap="closeDrawer">×</text>
        </view>

        <view class="drawer-body">
          <view class="upload-section">
            <text class="section-label">现场照片 (必传)</text>
            <view class="upload-grid">
              <view
                class="upload-item"
                v-for="(img, idx) in imageList"
                :key="idx"
              >
                <image
                  :src="img.tempPath"
                  mode="aspectFill"
                  @tap="previewImage(img)"
                ></image>
                <view class="delete-icon" @tap="removeImage(idx)">×</view>
              </view>
              <view
                class="upload-btn"
                v-if="imageList.length < 2"
                @tap="chooseImage"
              >
                <text class="plus">+</text>
                <text class="upload-txt">上传图片</text>
              </view>
            </view>
          </view>

          <view class="remark-section">
            <text class="section-label">备注</text>
            <textarea
              class="remark-input"
              v-model="remark"
              placeholder="请输入备注信息"
              maxlength="200"
            />
          </view>

          <view class="submit-btn" @tap="handleSubmit">
            <text>{{ checkType === "0" ? "立即签到" : "立即签退" }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import api, { BASE_URL } from "@/api/index";
import { onMounted, ref } from "vue";
const latitude = ref(21.8567);
const longitude = ref(111.9632);
const markers = ref([]);
const currentAddress = ref("");
const selectedCompanyName = ref("");
const selectedCompanyId = ref(null);

const recentList = ref([]);
const showDrawer = ref(false);
const checkType = ref("0"); // 0: 签到, 1: 签退
const imageList = ref([]);
const remark = ref("正常打卡");

// 统一处理图片全路径 - 微信小程序要求HTTPS
const getFullUrl = (url) => {
  if (!url) return "";
  // 如果是临时文件路径，直接返回
  if (url.startsWith("wxfile://") || url.startsWith("http://tmp")) {
    return url;
  }
  let fullUrl = url;
  // 如果不是完整URL，拼接基础路径
  if (!url.startsWith("http")) {
    fullUrl = BASE_URL + url;
  }
  // 微信小程序要求使用HTTPS，将HTTP转换为HTTPS
  if (fullUrl.startsWith("http://")) {
    fullUrl = fullUrl.replace("http://", "https://");
  }
  return fullUrl;
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转历史记录
const goHistory = () => {
  uni.navigateTo({
    url: "/pages/checkin/history",
  });
};

// 获取位置
const getLocation = () => {
  currentAddress.value = "正在获取位置...";
  uni.getLocation({
    type: "gcj02",
    success: (res) => {
      latitude.value = res.latitude;
      longitude.value = res.longitude;
      updateMarkers();
      // 使用逆地理编码获取真实地址
      reverseGeocode(res.latitude, res.longitude);
    },
    fail: (err) => {
      console.error("获取位置失败", err);
      currentAddress.value = "获取位置失败，请点击刷新重试";
      uni.showToast({
        title: "获取位置失败",
        icon: "none",
      });
    },
  });
};

// 逆地理编码获取地址 - 使用直接API调用
const reverseGeocode = (lat, lng) => {
  const key = "M6CBZ-PLKCQ-LWE5M-2EIAU-OX5T6-7HBLQ";
  const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=${key}&get_poi=0`;

  uni.request({
    url: url,
    method: "GET",
    success: (res) => {
      if (res.statusCode === 200 && res.data && res.data.status === 0) {
        currentAddress.value =
          res.data.result.address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      } else {
        console.error("逆地理编码失败", res);
        currentAddress.value = `当前位置: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    },
    fail: (err) => {
      console.error("请求失败", err);
      currentAddress.value = `当前位置: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    },
  });
};

const updateMarkers = () => {
  markers.value = [
    {
      id: 1,
      latitude: latitude.value,
      longitude: longitude.value,
      iconPath: "/static/tabbar/info.png", // 使用存在的图标
      width: 32,
      height: 32,
    },
  ];
};

// 打开抽屉
const openDrawer = (type) => {
  checkType.value = type;
  showDrawer.value = true;
  imageList.value = [];
  remark.value = "正常打卡";
};

// 关闭抽屉
const closeDrawer = () => {
  showDrawer.value = false;
};

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 2 - imageList.value.length,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      res.tempFilePaths.forEach((path) => {
        uploadImg(path);
      });
    },
  });
};

const uploadImg = async (tempPath) => {
  try {
    // 先添加临时路径用于显示
    const imgObj = { tempPath: tempPath, serverUrl: "", uploading: true };
    imageList.value.push(imgObj);
    const currentIndex = imageList.value.length - 1;

    // 获取 token
    const token = uni.getStorageSync("token");

    // 直接调用 /common/upload 接口
    uni.uploadFile({
      url: BASE_URL + "/common/upload",
      filePath: tempPath,
      name: "file",
      formData: {},
      header: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      success: (uploadRes) => {
        try {
          console.log("上传响应原始数据:", uploadRes.data);
          const res = JSON.parse(uploadRes.data);
          console.log("上传响应解析后:", res);

          // 处理返回的 URL - 支持多种格式
          let url = null;

          // 如果返回的是数组（uploads 接口可能返回文件列表）
          if (Array.isArray(res)) {
            url = res[0]?.url || res[0]?.fileName || res[0]?.filePath;
          } else if (res.data && Array.isArray(res.data)) {
            url =
              res.data[0]?.url ||
              res.data[0]?.fileName ||
              res.data[0]?.filePath;
          } else {
            // 常规对象格式
            url =
              res.url ||
              res.fileName ||
              res.filePath ||
              (res.data &&
                (res.data.url || res.data.fileName || res.data.filePath));
          }

          console.log("提取的URL:", url);

          if (url) {
            imageList.value[currentIndex].serverUrl = url;
            imageList.value[currentIndex].uploading = false;
            console.log("图片上传成功，URL:", url);
          } else {
            console.error("上传返回无效URL:", res);
            imageList.value.splice(currentIndex, 1);
            uni.showToast({ title: res.msg || "上传失败", icon: "none" });
          }
        } catch (e) {
          console.error("解析上传响应失败", e, uploadRes.data);
          imageList.value.splice(currentIndex, 1);
          uni.showToast({ title: "上传失败", icon: "none" });
        }
      },
      fail: (err) => {
        console.error("上传图片失败", err);
        imageList.value.splice(currentIndex, 1);
        uni.showToast({ title: "上传失败", icon: "none" });
      },
    });
  } catch (e) {
    console.error("上传图片失败", e);
    uni.showToast({ title: "上传失败", icon: "none" });
  }
};

const removeImage = (index) => {
  imageList.value.splice(index, 1);
};

const previewImage = (imgObj) => {
  uni.previewImage({
    urls: imageList.value.map((i) => i.tempPath),
    current: imgObj.tempPath,
  });
};

// 提交签到/签退
const handleSubmit = async () => {
  if (imageList.value.length === 0) {
    return uni.showToast({ title: "请至少上传一张照片", icon: "none" });
  }

  // 检查是否所有图片都上传成功
  const pendingImages = imageList.value.filter((img) => !img.serverUrl);
  if (pendingImages.length > 0) {
    return uni.showToast({ title: "图片上传中，请稍候", icon: "none" });
  }

  try {
    uni.showLoading({ title: "提交中...", mask: true });
    const payload = {
      companyId: selectedCompanyId.value,
      checkInType: checkType.value,
      checkInAddress: currentAddress.value,
      latitude: latitude.value,
      longitude: longitude.value,
      remark: remark.value,
      imageUrls: imageList.value.map((img) => img.serverUrl).join(","),
    };

    const res = await api.addCheckIn(payload);
    if (res && (res.code === 200 || res.code === 0)) {
      uni.showToast({ title: "操作成功", icon: "success" });
      setTimeout(() => {
        closeDrawer();
        loadRecentList();
      }, 1500);
    } else {
      uni.showToast({ title: (res && res.msg) || "操作失败", icon: "none" });
    }
  } catch (e) {
    console.error("提交失败", e);
    uni.showToast({ title: "网络请求失败", icon: "none" });
  } finally {
    uni.hideLoading();
  }
};

// 加载最近记录
const loadRecentList = async () => {
  try {
    const res = await api.getCheckInList({
      pageNum: 1,
      pageSize: 5,
    });
    if (res && (res.code === 200 || res.code === 0)) {
      recentList.value = res.rows || res.data || [];
    }
  } catch (e) {
    console.error("获取最近记录失败", e);
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  if (typeof timeStr !== "string") return String(timeStr);
  return timeStr.substring(0, 19).replace("T", " ");
};

onMounted(() => {
  try {
    // 从本地存储获取用户选择的公司
    selectedCompanyId.value = uni.getStorageSync("selectedCompanyId");
    selectedCompanyName.value =
      uni.getStorageSync("selectedCompanyName") || "未选择公司";

    getLocation();
    loadRecentList();
  } catch (e) {
    console.error("onMounted 错误", e);
  }
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
  z-index: 100;
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

.map-container {
  width: 100%;
  height: 40vh;
  flex-shrink: 0;
}

.map {
  width: 100%;
  height: 100%;
}

.content-panel {
  flex: 1;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  margin-top: -30rpx;
  position: relative;
  z-index: 10;
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10rpx 20rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.company-info {
  text-align: center;
  margin-bottom: 30rpx;
}

.company-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.location-box {
  background: #f9f9f9;
  padding: 24rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40rpx;
}

.location-main {
  display: flex;
  align-items: center;
  flex: 1;
}

.location-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.location-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.4;
}

.refresh-btn {
  padding: 10rpx 20rpx;
  background: #fff;
  border: 1rpx solid #eee;
  border-radius: 30rpx;
}

.refresh-text {
  font-size: 24rpx;
  color: #1e88e5;
}

.action-btns {
  display: flex;
  gap: 30rpx;
  margin-bottom: 40rpx;
}

.btn {
  flex: 1;
  height: 100rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.check-in {
  background: #1e88e5;
}

.check-out {
  background: #ef5350;
}

.btn-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.history-preview {
  flex: 1;
  overflow-y: auto;
}

.preview-item {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.item-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-top: 14rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.item-dot.in {
  background: #1e88e5;
}
.item-dot.out {
  background: #ef5350;
}

.item-content {
  flex: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.item-type {
  font-size: 28rpx;
  color: #1e88e5;
  font-weight: 500;
}

.item-dot.out + .item-content .item-type {
  color: #ef5350;
}

.item-time {
  font-size: 24rpx;
  color: #999;
}

.item-addr {
  display: flex;
  align-items: center;
}

.addr-text {
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-history {
  text-align: center;
  padding: 30rpx 0;
}

.view-history text {
  font-size: 26rpx;
  color: #1e88e5;
}

/* 抽屉样式 */
.drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.drawer-content {
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 40rpx 30rpx;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.drawer-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.drawer-close {
  font-size: 48rpx;
  color: #999;
  padding: 10rpx;
}

.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.section-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 20rpx;
}

.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.upload-item,
.upload-btn {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  position: relative;
}

.upload-item image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.delete-icon {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.upload-btn {
  border: 2rpx dashed #ccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.plus {
  font-size: 60rpx;
  color: #ccc;
  line-height: 1;
}

.upload-txt {
  font-size: 24rpx;
  color: #999;
}

.remark-input {
  width: 100%;
  height: 160rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.submit-btn {
  height: 90rpx;
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
}
</style>
