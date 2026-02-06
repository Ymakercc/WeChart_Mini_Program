<template>
  <view class="page">
    <!-- 导航栏 -->
    <uni-nav-bar
      fixed
      status-bar
      left-icon="back"
      title="巡检登记"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y>
      <view class="form-container">
        <uni-forms
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="160rpx"
        >
          <!-- 单位名称 -->
          <uni-forms-item label="单位名称" name="companyName">
            <text class="readonly-text">{{
              formData.companyName || "未选择公司"
            }}</text>
          </uni-forms-item>

          <!-- 维保类型 -->
          <uni-forms-item label="维保类型" name="inspectionType">
            <radio-group @change="onTypeChange" class="radio-group">
              <label
                class="radio-item"
                v-for="item in typeOptions"
                :key="item.value"
              >
                <radio
                  :value="item.value"
                  :checked="formData.inspectionType === item.value"
                  color="#e53935"
                />
                <text>{{ item.label }}</text>
              </label>
            </radio-group>
          </uni-forms-item>

          <!-- 建筑名称 -->
          <uni-forms-item label="建筑名称" name="buildingId">
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
          <uni-forms-item label="系统名称" name="systemType">
            <view class="picker-wrapper" @tap="showSystemPicker = true">
              <text v-if="!formData.systemName" class="placeholder"
                >请选择</text
              >
              <text v-else>{{ formData.systemName }}</text>
              <text class="arrow">›</text>
            </view>
          </uni-forms-item>

          <!-- 设备名称 -->
          <uni-forms-item label="设备名称" name="equipmentName">
            <view class="picker-wrapper" @tap="showEquipmentPicker = true">
              <text v-if="!formData.equipmentName" class="placeholder"
                >请输入或选择</text
              >
              <text v-else>{{ formData.equipmentName }}</text>
              <text class="arrow">›</text>
            </view>
          </uni-forms-item>

          <!-- 设备数量 -->
          <uni-forms-item label="设备数量" name="equipmentCount">
            <uni-number-box
              v-model="formData.equipmentCount"
              :min="1"
              :max="999"
              color="#e53935"
            />
          </uni-forms-item>

          <!-- 具体位置 -->
          <uni-forms-item label="具体位置" name="location" required>
            <uni-easyinput
              v-model="formData.location"
              placeholder="必填"
              maxlength="200"
            />
            <text class="char-count"
              >{{ formData.location?.length || 0 }}/200</text
            >
          </uni-forms-item>

          <!-- 巡检时间 -->
          <uni-forms-item label="巡检时间" name="inspectionTime">
            <uni-datetime-picker
              type="datetime"
              v-model="formData.inspectionTime"
              :clear-icon="false"
            />
          </uni-forms-item>

          <!-- 设备状态 -->
          <uni-forms-item label="设备状态" name="equipmentStatus">
            <view class="status-row">
              <text>{{
                formData.equipmentStatus === "0" ? "正常" : "异常"
              }}</text>
              <switch
                :checked="formData.equipmentStatus === '0'"
                @change="onStatusChange"
                color="#e53935"
              />
            </view>
          </uni-forms-item>

          <!-- 详细备注 -->
          <uni-forms-item label="详细备注" name="remark">
            <textarea
              class="remark-input"
              v-model="formData.remark"
              placeholder="请输入"
              maxlength="500"
            />
            <text class="char-count"
              >{{ formData.remark?.length || 0 }}/500</text
            >
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
      </view>
    </scroll-view>

    <!-- 建筑选择器 -->
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
            <view class="picker-item" v-for="item in floorList" :key="item">{{
              item
            }}</view>
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
            <view
              class="picker-item"
              v-for="item in systemList"
              :key="item.value"
              >{{ item.label }}</view
            >
          </picker-view-column>
        </picker-view>
      </view>
    </view>

    <!-- 设备选择器 -->
    <view
      class="picker-mask"
      v-if="showEquipmentPicker"
      @tap="showEquipmentPicker = false"
    >
      <view class="picker-popup" @tap.stop>
        <view class="picker-header">
          <text @tap="showEquipmentPicker = false">取消</text>
          <text class="picker-title">选择设备</text>
          <text @tap="confirmEquipment">确定</text>
        </view>
        <picker-view
          :value="[equipmentIndex]"
          @change="onEquipmentChange"
          class="picker-view"
        >
          <picker-view-column>
            <view
              class="picker-item"
              v-for="item in equipmentList"
              :key="item"
              >{{ item }}</view
            >
          </picker-view-column>
        </picker-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import api, { BASE_URL } from "@/api/index";
import { onMounted, ref } from "vue";

const formRef = ref(null);

const formData = ref({
  companyId: null,
  companyName: "",
  inspectionType: "1", // 默认巡查
  buildingId: null,
  buildingName: "",
  floor: "",
  systemType: "",
  systemName: "",
  equipmentName: "",
  equipmentCount: 1,
  location: "",
  inspectionTime: "",
  equipmentStatus: "0", // 默认正常
  remark: "",
});

const rules = {
  location: { rules: [{ required: true, errorMessage: "请输入具体位置" }] },
};

// 维保类型选项
const typeOptions = [
  { label: "测试", value: "0" },
  { label: "巡查", value: "1" },
  { label: "保养", value: "2" },
];

// 系统类型
const systemList = ref([
  { label: "消火栓系统", value: "01" },
  { label: "自动喷水灭火系统", value: "02" },
  { label: "火灾自动报警系统", value: "03" },
  { label: "消防供水设施", value: "04" },
  { label: "防排烟系统", value: "05" },
  { label: "应急照明系统", value: "06" },
  { label: "灭火器", value: "07" },
]);

// 设备列表（可根据系统动态获取）
const equipmentList = ref([
  "消火栓",
  "消防水泵及控制柜",
  "喷淋头",
  "烟感探测器",
  "手动报警按钮",
  "消防水箱",
  "排烟风机",
  "应急灯",
  "灭火器",
]);

const buildingList = ref([]);
const floorList = ref([]);
const imageList = ref([]);

const showBuildingPicker = ref(false);
const showFloorPicker = ref(false);
const showSystemPicker = ref(false);
const showEquipmentPicker = ref(false);

const buildingIndex = ref(0);
const floorIndex = ref(0);
const systemIndex = ref(0);
const equipmentIndex = ref(0);

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 获取当前时间
const getCurrentTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

// 维保类型变化
const onTypeChange = (e) => {
  formData.value.inspectionType = e.detail.value;
};

// 设备状态变化
const onStatusChange = (e) => {
  formData.value.equipmentStatus = e.detail.value ? "0" : "1";
};

// 获取当前公司ID和名称
const getCurrentCompany = async () => {
  try {
    const res = await api.getCurrentCompany();
    if ((res.code === 200 || res.code === 0) && res.data) {
      return res.data;
    }
  } catch (e) {
    console.error("获取当前公司失败:", e);
  }
  return null;
};

// 加载建筑列表
const loadBuildings = async () => {
  try {
    if (!formData.value.companyId) {
      const company = await getCurrentCompany();
      if (company) {
        formData.value.companyId = company.companyId;
        formData.value.companyName = company.companyName || "当前公司";
      }
    }

    if (!formData.value.companyId) return;

    const res = await api.getBuildingList({
      companyId: formData.value.companyId,
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
  const selected = systemList.value[systemIndex.value];
  formData.value.systemType = selected.value;
  formData.value.systemName = selected.label;
  showSystemPicker.value = false;
};

// 设备选择
const onEquipmentChange = (e) => {
  equipmentIndex.value = e.detail.value[0];
};

const confirmEquipment = () => {
  formData.value.equipmentName = equipmentList.value[equipmentIndex.value];
  showEquipmentPicker.value = false;
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
        console.log("上传响应:", uploadRes.data);
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
        console.error("解析上传响应失败", e);
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

  // 检查图片上传状态
  const pendingImages = imageList.value.filter((img) => img.uploading);
  if (pendingImages.length > 0) {
    return uni.showToast({ title: "图片上传中，请稍候", icon: "none" });
  }

  try {
    uni.showLoading({ title: "保存中...", mask: true });

    const payload = {
      companyId: formData.value.companyId,
      inspectionType: formData.value.inspectionType,
      buildingId: formData.value.buildingId,
      floor: formData.value.floor,
      systemType: formData.value.systemType,
      systemName: formData.value.systemName,
      equipmentName: formData.value.equipmentName,
      equipmentCount: formData.value.equipmentCount,
      location: formData.value.location,
      inspectionTime: formData.value.inspectionTime,
      equipmentStatus: formData.value.equipmentStatus,
      imageUrls: imageList.value.map((img) => img.serverUrl).join(","),
      remark: formData.value.remark,
    };

    const res = await api.addInspection(payload);
    if (res.code === 200 || res.code === 0) {
      uni.showToast({ title: "保存成功", icon: "success" });
      setTimeout(() => {
        uni.$emit("refreshInspectionList");
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

onMounted(async () => {
  // 设置当前时间
  formData.value.inspectionTime = getCurrentTime();

  // 从 API 加载公司信息
  try {
    const company = await getCurrentCompany();
    if (company) {
      formData.value.companyId = company.companyId;
      formData.value.companyName = company.companyName || "当前公司";
    } else {
      formData.value.companyName = "未选择公司";
    }
  } catch (e) {
    console.error("获取公司信息失败", e);
    formData.value.companyName = "未选择公司";
  }

  loadBuildings();
  generateFloors();
});
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
  padding-top: calc(14px + env(safe-area-inset-top));
}

.form-container {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
}

.readonly-text {
  font-size: 28rpx;
  color: #333;
}

.radio-group {
  display: flex;
  gap: 40rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #333;
}

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

.status-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
}

.status-row text {
  font-size: 28rpx;
  color: #333;
}

.char-count {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 24rpx;
  color: #999;
}

.remark-input {
  width: 100%;
  height: 160rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

/* 图片上传 */
.upload-section {
  margin-top: 20rpx;
  padding: 0 24rpx 24rpx;
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

.camera-icon {
  width: 48rpx;
  height: 48rpx;
  opacity: 0.5;
}

/* 保存按钮 */
.save-btn {
  margin: 40rpx 24rpx;
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

:deep(.uni-navbar__header-btns-left) {
  z-index: 10 !important;
  position: relative !important;
}

/* uni-forms 样式调整 */
:deep(.uni-forms-item) {
  padding: 20rpx 0;
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
