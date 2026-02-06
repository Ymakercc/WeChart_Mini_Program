<template>
  <view class="page">
    <!-- 使用 uni-nav-bar 自定义导航栏 -->
    <uni-nav-bar
      class="custom-nav"
      fixed
      status-bar
      left-icon="back"
      title="设备信息"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!--内容区域-->
    <view class="content">
      <!--tab切换区域-->
      <view class="tab">
        <view
          class="tab-item"
          :class="{ active: activeTab === 'input' }"
          @tap="activeTab = 'input'"
          >信息录入</view
        >
        <view
          class="tab-item"
          :class="{ active: activeTab === 'scan' }"
          @tap="handleScanTab"
          >扫码采集</view
        >
      </view>

      <!-- 信息录入表单 -->
      <scroll-view v-if="activeTab === 'input'" class="form-container" scroll-y>
        <uni-forms
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="160rpx"
          label-align="left"
        >
          <!-- 设备编号 -->
          <uni-forms-item label="设备编号" name="equipmentCode" required>
            <uni-easyinput
              v-model="formData.equipmentCode"
              placeholder="请输入设备编号"
            />
          </uni-forms-item>

          <!-- 所在建筑 -->
          <uni-forms-item label="所在建筑" name="buildingId">
            <view class="picker-wrapper" @tap="showBuildingPicker = true">
              <text v-if="!formData.buildingName" class="placeholder"
                >请选择</text
              >
              <text v-else>{{ formData.buildingName }}</text>
              <text class="arrow">›</text>
            </view>
          </uni-forms-item>

          <!-- 所在楼层 -->
          <uni-forms-item label="所在楼层" name="floor">
            <view class="picker-wrapper" @tap="showFloorPicker = true">
              <text v-if="!formData.floor" class="placeholder">请选择</text>
              <text v-else>{{ formData.floor }}</text>
              <text class="arrow">›</text>
            </view>
          </uni-forms-item>

          <!-- 系统名称 -->
          <uni-forms-item label="系统名称" name="equipmentType">
            <view class="picker-wrapper" @tap="showSystemPicker = true">
              <text v-if="!formData.equipmentType" class="placeholder"
                >请选择</text
              >
              <text v-else>{{ formData.equipmentType }}</text>
              <text class="arrow">›</text>
            </view>
          </uni-forms-item>

          <!-- 设备名称 -->
          <uni-forms-item label="设备名称" name="equipmentName" required>
            <uni-easyinput
              v-model="formData.equipmentName"
              placeholder="请输入设备名称"
            />
          </uni-forms-item>

          <!-- 生产厂家 -->
          <uni-forms-item label="生产厂家" name="brand">
            <uni-easyinput
              v-model="formData.brand"
              placeholder="请输入生产厂家"
            />
          </uni-forms-item>

          <!-- 有效日期 -->
          <uni-forms-item label="有效日期" name="warrantyEndDate">
            <uni-datetime-picker
              type="date"
              v-model="formData.warrantyEndDate"
              :clear-icon="false"
            />
          </uni-forms-item>

          <!-- 设备数量 -->
          <uni-forms-item label="设备数量" name="quantity">
            <uni-number-box
              v-model="formData.quantity"
              :min="1"
              :max="999"
              color="#e53935"
            />
          </uni-forms-item>

          <!-- 具体位置 -->
          <uni-forms-item label="具体位置" name="location" required>
            <uni-easyinput
              v-model="formData.location"
              placeholder="请输入具体位置"
            />
          </uni-forms-item>

          <!-- 规格型号 -->
          <uni-forms-item label="规格型号" name="specifications">
            <uni-easyinput
              v-model="formData.specifications"
              placeholder="选填"
            />
          </uni-forms-item>
        </uni-forms>

        <!-- 图片上传 -->
        <view class="upload-section">
          <view class="upload-grid">
            <view
              class="upload-item"
              v-for="(img, idx) in imageList"
              :key="idx"
            >
              <image
                :src="img.tempPath"
                mode="aspectFill"
                @tap="previewImage(idx)"
              />
              <view class="delete-icon" @tap="removeImage(idx)">×</view>
            </view>
            <view
              class="upload-btn"
              v-if="imageList.length < 4"
              @tap="chooseImage"
            >
              <uni-icons type="camera" size="32" color="#999" />
            </view>
          </view>
        </view>

        <!-- 保存按钮 -->
        <view class="save-btn" @tap="handleSave">
          <text>保存</text>
        </view>
      </scroll-view>
    </view>

    <!-- 建筑选择器 -->
    <uni-popup ref="buildingPopup" type="bottom" v-if="showBuildingPicker">
      <view class="picker-popup">
        <view class="picker-header">
          <text @tap="showBuildingPicker = false">取消</text>
          <text class="picker-title">选择建筑</text>
          <text @tap="confirmBuilding">确定</text>
        </view>
        <picker-view
          :value="[buildingIndex]"
          @change="onBuildingChange"
          class="picker-view"
        >
          <picker-view-column>
            <view
              class="picker-item"
              v-for="item in buildingList"
              :key="item.buildingId"
            >
              {{ item.buildingName }}
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </uni-popup>

    <!-- 楼层选择器 -->
    <view
      class="picker-mask"
      v-if="showFloorPicker"
      @tap="showFloorPicker = false"
    >
      <view class="picker-popup" @tap.stop>
        <view class="picker-header">
          <text @tap="showFloorPicker = false">取消</text>
          <text class="picker-title">选择楼层</text>
          <text @tap="confirmFloor">确定</text>
        </view>
        <picker-view
          :value="[floorIndex]"
          @change="onFloorChange"
          class="picker-view"
        >
          <picker-view-column>
            <view class="picker-item" v-for="item in floorList" :key="item">
              {{ item }}
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>

    <!-- 系统选择器 -->
    <view
      class="picker-mask"
      v-if="showSystemPicker"
      @tap="showSystemPicker = false"
    >
      <view class="picker-popup" @tap.stop>
        <view class="picker-header">
          <text @tap="showSystemPicker = false">取消</text>
          <text class="picker-title">选择系统</text>
          <text @tap="confirmSystem">确定</text>
        </view>
        <picker-view
          :value="[systemIndex]"
          @change="onSystemChange"
          class="picker-view"
        >
          <picker-view-column>
            <view class="picker-item" v-for="item in systemList" :key="item">
              {{ item }}
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>

    <!-- 建筑选择器遮罩 -->
    <view
      class="picker-mask"
      v-if="showBuildingPicker"
      @tap="showBuildingPicker = false"
    >
      <view class="picker-popup" @tap.stop>
        <view class="picker-header">
          <text @tap="showBuildingPicker = false">取消</text>
          <text class="picker-title">选择建筑</text>
          <text @tap="confirmBuilding">确定</text>
        </view>
        <picker-view
          :value="[buildingIndex]"
          @change="onBuildingChange"
          class="picker-view"
        >
          <picker-view-column>
            <view
              class="picker-item"
              v-for="item in buildingList"
              :key="item.buildingId"
            >
              {{ item.buildingName }}
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import api, { BASE_URL } from "@/api/index";
import { onMounted, ref } from "vue";

const activeTab = ref("input");
const formRef = ref(null);
const isEdit = ref(false);
const equipmentId = ref(null);

const formData = ref({
  equipmentCode: "",
  buildingId: "",
  buildingName: "",
  floor: "",
  equipmentType: "",
  equipmentName: "",
  brand: "",
  warrantyEndDate: "",
  quantity: 1,
  location: "",
  specifications: "",
});

// 图片列表
const imageList = ref([]);

const rules = {
  equipmentCode: {
    rules: [{ required: true, errorMessage: "请输入设备编号" }],
  },
  equipmentName: {
    rules: [{ required: true, errorMessage: "请输入设备名称" }],
  },
  location: { rules: [{ required: true, errorMessage: "请输入具体位置" }] },
};

const buildingList = ref([]);
const floorList = ref([]);
const systemList = ref([
  "消火栓系统",
  "自动喷水灭火系统",
  "火灾自动报警系统",
  "防排烟系统",
  "应急照明系统",
  "灭火器",
]);

const showBuildingPicker = ref(false);
const showFloorPicker = ref(false);
const showSystemPicker = ref(false);

const buildingIndex = ref(0);
const floorIndex = ref(0);
const systemIndex = ref(0);

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 获取当前公司ID
const getCurrentCompanyId = async () => {
  try {
    const res = await api.getCurrentCompany();
    if ((res.code === 200 || res.code === 0) && res.data) {
      return res.data.companyId;
    }
  } catch (e) {
    console.error("获取当前公司失败:", e);
  }
  return null;
};

// 加载建筑列表
const loadBuildings = async () => {
  try {
    const companyId = await getCurrentCompanyId();
    if (!companyId) return;

    const res = await api.getBuildingList({
      companyId: companyId,
      pageNum: 1,
      pageSize: 100,
    });

    if (res.code === 200 || res.code === 0) {
      buildingList.value = res.rows || res.data || [];
    }
  } catch (e) {
    console.error("获取建筑列表失败", e);
  }
};

// 生成楼层列表
const generateFloors = (aboveGround = 10, underground = 2) => {
  const floors = [];
  for (let i = underground; i >= 1; i--) {
    floors.push(`B${i}`);
  }
  for (let i = 1; i <= aboveGround; i++) {
    floors.push(`${i}F`);
  }
  floorList.value = floors;
};

// 建筑选择
const onBuildingChange = (e) => {
  buildingIndex.value = e.detail.value[0];
};

const confirmBuilding = () => {
  if (buildingList.value.length > 0) {
    const selected = buildingList.value[buildingIndex.value];
    formData.value.buildingId = selected.buildingId;
    formData.value.buildingName = selected.buildingName;
    generateFloors(
      selected.aboveGroundFloors || 10,
      selected.undergroundFloors || 2,
    );
  }
  showBuildingPicker.value = false;
};

// 楼层选择
const onFloorChange = (e) => {
  floorIndex.value = e.detail.value[0];
};

const confirmFloor = () => {
  if (floorList.value.length > 0) {
    formData.value.floor = floorList.value[floorIndex.value];
  }
  showFloorPicker.value = false;
};

// 系统选择
const onSystemChange = (e) => {
  systemIndex.value = e.detail.value[0];
};

const confirmSystem = () => {
  formData.value.equipmentType = systemList.value[systemIndex.value];
  showSystemPicker.value = false;
};

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

// 扫码
const handleScan = () => {
  uni.scanCode({
    success: async (res) => {
      try {
        const equipmentCode = extractEquipmentCode(res.result);
        console.log("扫码结果:", res.result, "提取的设备编码:", equipmentCode);
        const scanRes = await api.scanEquipment(equipmentCode);
        if ((scanRes.code === 200 || scanRes.code === 0) && scanRes.data) {
          const data = scanRes.data;
          // 将API返回的字段映射到表单字段
          formData.value.equipmentCode = data.equipmentCode || "";
          formData.value.equipmentName = data.equipmentName || "";
          formData.value.buildingId = data.buildingId || "";
          formData.value.buildingName = data.buildingName || "";
          formData.value.floor = data.floorNo || ""; // API返回 floorNo, 表单用 floor
          formData.value.equipmentType =
            data.systemName || data.equipmentType || ""; // 系统名称
          formData.value.brand = data.manufacturer || ""; // API返回 manufacturer, 表单用 brand
          formData.value.warrantyEndDate = data.expireDate || ""; // API返回 expireDate, 表单用 warrantyEndDate
          formData.value.quantity = data.quantity || 1;
          formData.value.location = data.location || "";
          formData.value.specifications = data.model || ""; // API返回 model, 表单用 specifications

          // 扫码采集是用来创建新设备的，不设置编辑模式
          // 即使扫到已存在的设备信息，也是作为模板来创建新设备

          activeTab.value = "input";
          uni.showToast({ title: "扫码成功", icon: "success" });
        } else {
          uni.showToast({
            title: scanRes.msg || "未找到设备信息",
            icon: "none",
          });
        }
      } catch (e) {
        console.error("扫码失败:", e);
        uni.showToast({ title: "扫码失败", icon: "none" });
      }
    },
    fail: () => {
      uni.showToast({ title: "扫码取消", icon: "none" });
    },
  });
};

// 点击扫码Tab时直接触发扫码
const handleScanTab = () => {
  activeTab.value = "scan";
  handleScan();
};

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 4 - imageList.value.length,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      res.tempFilePaths.forEach((path) => {
        uploadImg(path);
      });
    },
  });
};

// 上传图片
const uploadImg = (tempPath) => {
  const imgObj = { tempPath: tempPath, serverUrl: "", uploading: true };
  imageList.value.push(imgObj);
  const currentIndex = imageList.value.length - 1;

  const token = uni.getStorageSync("token");

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
        const res = JSON.parse(uploadRes.data);
        const url =
          res.url || res.fileName || res.filePath || (res.data && res.data.url);
        if (url) {
          imageList.value[currentIndex].serverUrl = url;
          imageList.value[currentIndex].uploading = false;
        } else {
          imageList.value.splice(currentIndex, 1);
          uni.showToast({ title: res.msg || "上传失败", icon: "none" });
        }
      } catch (e) {
        imageList.value.splice(currentIndex, 1);
        uni.showToast({ title: "上传失败", icon: "none" });
      }
    },
    fail: () => {
      imageList.value.splice(currentIndex, 1);
      uni.showToast({ title: "上传失败", icon: "none" });
    },
  });
};

// 移除图片
const removeImage = (index) => {
  imageList.value.splice(index, 1);
};

// 预览图片
const previewImage = (index) => {
  uni.previewImage({
    urls: imageList.value.map((i) => i.tempPath),
    current: index,
  });
};

// 保存
const handleSave = async () => {
  try {
    await formRef.value.validate();
  } catch (e) {
    return;
  }

  try {
    uni.showLoading({ title: "保存中...", mask: true });

    const companyId = await getCurrentCompanyId();
    const payload = {
      ...formData.value,
      companyId: companyId,
      imageUrls: imageList.value.map((img) => img.serverUrl).join(","),
    };

    let res;
    if (isEdit.value && equipmentId.value) {
      payload.equipmentId = equipmentId.value;
      res = await api.editEquipment(payload);
    } else {
      res = await api.addEquipment(payload);
    }

    if (res.code === 200 || res.code === 0) {
      uni.showToast({ title: "保存成功", icon: "success" });
      setTimeout(() => {
        uni.$emit("refreshEquipmentList");
        uni.navigateBack();
      }, 1500);
    } else {
      uni.showToast({ title: res.msg || "保存失败", icon: "none" });
    }
  } catch (e) {
    console.error("保存失败", e);
    uni.showToast({ title: "保存失败", icon: "none" });
  } finally {
    uni.hideLoading();
  }
};

onMounted(() => {
  loadBuildings();
  generateFloors();

  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};

  if (options.id) {
    isEdit.value = true;
    equipmentId.value = options.id;
    loadEquipmentDetail(options.id);
  } else if (options.fromScan === "true") {
    // 从扫一扫页面跳转过来，读取缓存的设备数据
    const scanData = uni.getStorageSync("scanEquipmentData");
    if (scanData) {
      formData.value = {
        ...formData.value,
        ...scanData,
      };
      // 使用后清除缓存
      uni.removeStorageSync("scanEquipmentData");
    }
  }
});

const loadEquipmentDetail = async (id) => {
  try {
    const res = await api.getEquipmentDetail(id);
    if (res.code === 200 && res.data) {
      Object.assign(formData.value, res.data);
    }
  } catch (e) {
    console.error("获取设备详情失败", e);
  }
};
</script>

<style scoped>
.page {
  width: 100vw;
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  padding-top: calc(16px + env(safe-area-inset-top));
  background: #f5f5f5;
  box-sizing: border-box;
}

/* Tab 切换按钮组 */
.tab {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  flex-shrink: 0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
  background: #fff;
  transition: all 0.3s;
}

.tab-item.active {
  color: #e53935;
  font-weight: bold;
  background: rgba(229, 57, 53, 0.08);
}

.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #e53935;
  border-radius: 2rpx;
}

/* 表单容器 */
.form-container {
  width: 94%;
  flex: 1;
  margin-top: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  padding-bottom: 40rpx;
}

/* 选择器包装 */
.picker-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 70rpx;
}

.picker-wrapper .placeholder {
  color: #999;
  font-size: 28rpx;
}

.picker-wrapper .arrow {
  color: #ccc;
  font-size: 32rpx;
}

/* 保存按钮 */
.save-btn {
  margin-top: 30rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

/* 图片上传 */
.upload-section {
  margin-top: 20rpx;
  padding: 0 0 10rpx;
}

.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.upload-item,
.upload-btn {
  width: 120rpx;
  height: 120rpx;
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
  width: 36rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.upload-btn {
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
}

/* 扫码内容 */
.scan-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
  background: #fff;
  border-radius: 16rpx;
}

.scan-placeholder {
  text-align: center;
}

.scan-placeholder text {
  font-size: 28rpx;
  color: #666;
}

.scan-btn {
  margin-top: 40rpx;
  padding: 20rpx 60rpx;
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  border-radius: 40rpx;
  display: inline-flex;
}

.scan-btn text {
  color: #fff;
  font-size: 28rpx;
}

/* 选择器弹窗 */
.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.picker-popup {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}

.picker-header text {
  font-size: 28rpx;
  color: #e53935;
}

.picker-title {
  color: #333 !important;
  font-weight: bold;
}

.picker-view {
  height: 400rpx;
}

.picker-item {
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
}

/* 覆盖 uni-nav-bar 标题样式 */
:deep(.uni-nav-bar-text) {
  font-size: 36rpx !important;
  font-weight: bold !important;
}

/* 让标题容器绝对定位实现真正居中 */
:deep(.uni-navbar__header-container) {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  display: flex !important;
  justify-content: center !important;
  pointer-events: none;
}

:deep(.uni-navbar__header-container-inner) {
  pointer-events: auto;
}

/* 确保左侧按钮在标题容器之上可点击 */
:deep(.uni-navbar__header-btns-left) {
  z-index: 10 !important;
  position: relative !important;
}

/* uni-forms 样式调整 */
:deep(.uni-forms-item) {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

:deep(.uni-forms-item__label) {
  font-size: 28rpx !important;
  color: #333 !important;
}

:deep(.uni-easyinput__content) {
  border: none !important;
  background: transparent !important;
}

:deep(.uni-easyinput__content-input) {
  font-size: 28rpx !important;
}
</style>
