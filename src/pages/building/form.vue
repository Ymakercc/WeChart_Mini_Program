<template>
  <view class="page">
    <!-- 使用 uni-nav-bar 自定义导航栏 -->
    <uni-nav-bar
      class="custom-nav"
      fixed
      status-bar
      left-icon="back"
      :title="isEdit ? '编辑建筑' : '建筑登记'"
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
          label-width="200rpx"
        >
          <!-- 建筑名称 -->
          <uni-forms-item label="建筑名称" name="buildingName" required>
            <uni-easyinput v-model="formData.buildingName" placeholder="必填" />
          </uni-forms-item>

          <!-- 自动消防设施 -->
          <uni-forms-item label="自动消防设施" name="hasFireFacilities">
            <radio-group @change="onFireFacilitiesChange" class="radio-group">
              <label class="radio-item">
                <radio
                  value="true"
                  :checked="formData.hasFireFacilities === true"
                  color="#2196F3"
                />
                <text>有</text>
              </label>
              <label class="radio-item">
                <radio
                  value="false"
                  :checked="formData.hasFireFacilities === false"
                  color="#2196F3"
                />
                <text>无</text>
              </label>
            </radio-group>
          </uni-forms-item>

          <!-- 建筑地址 -->
          <uni-forms-item label="建筑地址" name="address">
            <uni-easyinput
              v-model="formData.address"
              :placeholder="defaultAddress"
            />
          </uni-forms-item>

          <!-- 建筑类别 -->
          <uni-forms-item label="建筑类别" name="buildingType">
            <view class="picker-wrapper" @tap="showTypePicker = true">
              <text v-if="!formData.buildingType" class="placeholder"
                >请选择</text
              >
              <text v-else>{{ formData.buildingType }}</text>
              <text class="arrow">›</text>
            </view>
          </uni-forms-item>

          <!-- 占地面积 -->
          <uni-forms-item label="占地面积(m²)" name="landArea">
            <uni-easyinput
              v-model="formData.landArea"
              type="digit"
              placeholder="选填"
            />
          </uni-forms-item>

          <!-- 建筑面积 -->
          <uni-forms-item label="建筑面积(m²)" name="area">
            <uni-easyinput
              v-model="formData.area"
              type="digit"
              placeholder="选填"
            />
          </uni-forms-item>

          <!-- 建筑高度 -->
          <uni-forms-item label="建筑高度(m)" name="buildingHeight" required>
            <uni-easyinput
              v-model="formData.buildingHeight"
              type="digit"
              placeholder="必填"
            />
          </uni-forms-item>

          <!-- 建筑层数 -->
          <uni-forms-item label="建筑层数" name="floors" required>
            <uni-easyinput
              v-model="formData.floors"
              type="number"
              placeholder="必填"
            />
          </uni-forms-item>

          <!-- 地上层数 -->
          <uni-forms-item label="地上层数" name="aboveGroundFloors" required>
            <uni-easyinput
              v-model="formData.aboveGroundFloors"
              type="number"
              placeholder="必填"
            />
          </uni-forms-item>

          <!-- 地下层数 -->
          <uni-forms-item label="地下层数" name="undergroundFloors" required>
            <uni-easyinput
              v-model="formData.undergroundFloors"
              type="number"
              placeholder="必填"
            />
          </uni-forms-item>

          <!-- 安全出口 -->
          <uni-forms-item label="安全出口(个)" name="evacuationExitCount">
            <uni-easyinput
              v-model="formData.evacuationExitCount"
              type="number"
              placeholder="选填"
            />
          </uni-forms-item>

          <!-- 疏散楼梯数 -->
          <uni-forms-item label="疏散楼梯数(个)" name="evacuationStairCount">
            <uni-easyinput
              v-model="formData.evacuationStairCount"
              type="number"
              placeholder="选填"
            />
          </uni-forms-item>

          <!-- 消防电梯数 -->
          <uni-forms-item label="消防电梯数(个)" name="fireElevatorCount">
            <uni-easyinput
              v-model="formData.fireElevatorCount"
              type="number"
              placeholder="选填"
            />
          </uni-forms-item>

          <!-- 避难层位置 -->
          <uni-forms-item label="避难层位置" name="refugeFloorLocation">
            <uni-easyinput
              v-model="formData.refugeFloorLocation"
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
      </view>
    </scroll-view>

    <!-- 建筑类别选择器 -->
    <view
      class="picker-mask"
      v-if="showTypePicker"
      @tap="showTypePicker = false"
    >
      <view class="picker-popup" @tap.stop>
        <view class="picker-header">
          <text @tap="showTypePicker = false">取消</text>
          <text class="picker-title">选择建筑类别</text>
          <text @tap="confirmType">确定</text>
        </view>
        <picker-view
          class="picker-view"
          :value="[typeIndex]"
          @change="onTypeChange"
        >
          <picker-view-column>
            <view
              class="picker-item"
              v-for="(item, index) in buildingTypes"
              :key="index"
            >
              {{ item }}
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

const formRef = ref(null);
const isEdit = ref(false);
const showTypePicker = ref(false);
const typeIndex = ref(0);
const defaultAddress = "广东省阳江市阳春市迎宾";
const imageList = ref([]);

// 建筑类别选项
const buildingTypes = [
  "单、多层民用建筑",
  "高层民用建筑",
  "工业建筑",
  "其他建筑",
];

// 表单数据
const formData = ref({
  buildingId: null,
  buildingCode: "",
  buildingName: "",
  buildingType: "",
  floors: "",
  undergroundFloors: "",
  area: "",
  buildingHeight: "",
  structureType: "",
  fireResistanceLevel: "",
  fireZoneCount: "",
  evacuationExitCount: "",
  evacuationStairCount: "",
  fireElevatorCount: "",
  refugeFloorLocation: "",
  completionDate: "",
  address: "",
  longitude: "",
  latitude: "",
  remark: "",
  hasFireFacilities: false,
  landArea: "",
  aboveGroundFloors: "",
});

// 表单验证规则
const rules = {
  buildingName: {
    rules: [{ required: true, errorMessage: "请输入建筑名称" }],
  },
  buildingHeight: {
    rules: [{ required: true, errorMessage: "请输入建筑高度" }],
  },
  floors: {
    rules: [{ required: true, errorMessage: "请输入建筑层数" }],
  },
  aboveGroundFloors: {
    rules: [{ required: true, errorMessage: "请输入地上层数" }],
  },
  undergroundFloors: {
    rules: [{ required: true, errorMessage: "请输入地下层数" }],
  },
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 自动消防设施变化
const onFireFacilitiesChange = (e) => {
  formData.value.hasFireFacilities = e.detail.value === "true";
};

// 类别选择变化
const onTypeChange = (e) => {
  typeIndex.value = e.detail.value[0];
};

// 确认类别选择
const confirmType = () => {
  formData.value.buildingType = buildingTypes[typeIndex.value];
  showTypePicker.value = false;
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

// 表单验证
const validateForm = async () => {
  try {
    await formRef.value.validate();
    return true;
  } catch (e) {
    return false;
  }
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

// 保存
const handleSave = async () => {
  if (!(await validateForm())) return;

  // 检查图片上传状态
  const pendingImages = imageList.value.filter((img) => img.uploading);
  if (pendingImages.length > 0) {
    return uni.showToast({ title: "图片上传中，请稍候", icon: "none" });
  }

  try {
    uni.showLoading({ title: "正在保存..." });

    // 获取当前选中的公司 ID
    const companyId = await getCurrentCompanyId();
    if (!companyId) {
      uni.showToast({ title: "未获取到公司信息", icon: "none" });
      return;
    }

    // 构造提交负载，确保数值类型正确
    const payload = {
      ...formData.value,
      companyId: Number(companyId),
      floors: Number(formData.value.floors),
      undergroundFloors: Number(formData.value.undergroundFloors || 0),
      aboveGroundFloors: Number(formData.value.aboveGroundFloors || 0),
      area: Number(formData.value.area || 0),
      landArea: Number(formData.value.landArea || 0),
      buildingHeight: Number(formData.value.buildingHeight),
      fireZoneCount: Number(formData.value.fireZoneCount || 0),
      evacuationExitCount: Number(formData.value.evacuationExitCount || 0),
      evacuationStairCount: Number(formData.value.evacuationStairCount || 0),
      fireElevatorCount: Number(formData.value.fireElevatorCount || 0),
      imageUrls: imageList.value.map((img) => img.serverUrl).join(","),
      longitude: formData.value.longitude
        ? Number(formData.value.longitude)
        : null,
      latitude: formData.value.latitude
        ? Number(formData.value.latitude)
        : null,
    };

    let res;
    if (isEdit.value) {
      res = await api.updateBuilding(payload);
    } else {
      res = await api.addBuilding(payload);
    }

    if (res.code === 200 || res.code === 0) {
      uni.showToast({
        title: isEdit.value ? "编辑成功" : "添加成功",
        icon: "success",
      });

      // 通知列表页刷新
      uni.$emit("refreshBuildingList");

      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      uni.showToast({ title: res.msg || "保存失败", icon: "none" });
    }
  } catch (e) {
    console.error("保存失败:", e);
    uni.showToast({ title: "网络请求失败", icon: "none" });
  } finally {
    uni.hideLoading();
  }
};

// 页面加载
onMounted(async () => {
  // 检查是否是编辑模式
  const building = uni.getStorageSync("editBuilding");
  if (building) {
    isEdit.value = true;
    formData.value = {
      ...building,
      buildingName: building.buildingName || building.name,
      buildingHeight: building.buildingHeight || building.height,
      floors: building.floors || building.floorCount,
      area: building.area || building.buildingArea,
      autoFireSystem:
        building.autoFireSystem || (building.hasFireFacilities ? "1" : "0"),
    };
    // 清除缓存
    uni.removeStorageSync("editBuilding");

    // 设置类别索引
    const idx = buildingTypes.indexOf(building.buildingType);
    if (idx >= 0) {
      typeIndex.value = idx;
    }
  } else {
    // 新增模式：从 API 获取当前公司地址
    try {
      const res = await api.getCurrentCompany();
      if (
        (res.code === 200 || res.code === 0) &&
        res.data &&
        res.data.address
      ) {
        formData.value.address = res.data.address;
      }
    } catch (e) {
      console.error("获取公司地址失败:", e);
    }
  }
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

/* 导航栏右侧按钮 */
.nav-right-btn {
  font-size: 28rpx;
  color: #ffffff;
  padding: 0 20rpx;
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

/* 内容区域 */
.content {
  flex: 1;
  padding-top: calc(6px + env(safe-area-inset-top));
}

.form-container {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
}

/* uni-forms 样式调整 */
:deep(.uni-forms-item) {
  padding: 8rpx 0;
  margin-bottom: 0;
  border-bottom: 1rpx solid #f0f0f0;
}

:deep(.uni-forms-item__label) {
  font-size: 28rpx;
  color: #333;
}

:deep(.uni-easyinput__content) {
  background: transparent !important;
}

:deep(.uni-easyinput__content-input) {
  font-size: 28rpx;
  text-align: right;
}

/* 单选组 */
.radio-group {
  display: flex;
  justify-content: flex-end;
  gap: 40rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #333;
}

/* 选择器 */
.picker-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
  margin-left: 10rpx;
}

/* 图片上传 */
.upload-section {
  margin-top: 20rpx;
  padding: 0 0 24rpx;
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

/* 保存按钮 */
.save-btn {
  margin: 30rpx 0;
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
  color: #666;
}

.picker-header text:last-child {
  color: #e53935;
}

.picker-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}

.picker-view {
  height: 400rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #333;
}
</style>
