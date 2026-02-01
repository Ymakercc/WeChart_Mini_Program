<template>
  <view class="page">
    <view class="header">
      <text class="title">扫一扫</text>
    </view>
    <view class="content">
      <view class="scan-area">
        <view class="scan-box">
          <text class="scan-icon">📷</text>
          <text class="scan-text">点击扫描设备二维码</text>
          <button class="scan-btn" @tap="handleScan">开始扫描</button>
        </view>
      </view>
    </view>
    <view class="bottom-placeholder"></view>
    <TabBar :currentTab="2" />
  </view>
</template>

<script setup>
import api from "@/api/index";
import TabBar from "@/components/TabBar.vue";

// 从扫码结果中提取设备编码
const extractEquipmentCode = (scanResult) => {
  // 如果扫码结果是URL，提取最后一段作为设备编码
  // 例如: http://43.142.75.179:83/public/api/equipment/EQ505706330063 -> EQ505706330063
  if (scanResult.startsWith("http://") || scanResult.startsWith("https://")) {
    const parts = scanResult.split("/");
    return parts[parts.length - 1]; // 取URL最后一段
  }
  // 如果不是URL，直接返回扫码结果
  return scanResult;
};

const handleScan = () => {
  uni.scanCode({
    success: async (res) => {
      try {
        const equipmentCode = extractEquipmentCode(res.result);
        console.log("扫码结果:", res.result, "提取的设备编码:", equipmentCode);

        uni.showLoading({ title: "查询中...", mask: true });

        const scanRes = await api.scanEquipment(equipmentCode);

        uni.hideLoading();

        if ((scanRes.code === 200 || scanRes.code === 0) && scanRes.data) {
          const data = scanRes.data;

          // 将设备信息存入缓存，供设备表单页面读取
          const equipmentData = {
            equipmentCode: data.equipmentCode || "",
            equipmentName: data.equipmentName || "",
            buildingId: data.buildingId || "",
            buildingName: data.buildingName || "",
            floor: data.floorNo || "",
            equipmentType: data.systemName || data.equipmentType || "",
            brand: data.manufacturer || "",
            warrantyEndDate: data.expireDate || "",
            quantity: data.quantity || 1,
            location: data.location || "",
            specifications: data.model || "",
          };

          uni.setStorageSync("scanEquipmentData", equipmentData);

          uni.showToast({ title: "扫码成功", icon: "success" });

          setTimeout(() => {
            // 跳转到设备表单页面
            uni.navigateTo({
              url: "/pages/equipment/form?fromScan=true",
            });
          }, 1000);
        } else {
          uni.showToast({
            title: scanRes.msg || "未找到设备信息",
            icon: "none",
          });
        }
      } catch (e) {
        uni.hideLoading();
        console.error("扫码失败:", e);
        uni.showToast({ title: "扫码失败", icon: "none" });
      }
    },
    fail: () => {
      uni.showToast({ title: "扫码取消", icon: "none" });
    },
  });
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  padding: 60rpx 30rpx 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.content {
  flex: 1;
}

.scan-area {
  display: flex;
  justify-content: center;
  padding-top: 100rpx;
}

.scan-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 60rpx;
  border-radius: 20rpx;
  width: 80%;
}

.scan-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.scan-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
}

.scan-btn {
  background: linear-gradient(90deg, #e53935, #ef5350);
  color: #fff;
  font-size: 30rpx;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  border: none;
}

.scan-btn::after {
  border: none;
}

.bottom-placeholder {
  height: 120rpx;
}
</style>
