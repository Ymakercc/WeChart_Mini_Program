<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">{{ isEdit ? "编辑建筑" : "建筑登记" }}</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 内容区域 -->
    <view class="content">
      <!-- 表单内容 -->
      <scroll-view class="content-item" scroll-y>
        <!-- 白色卡片容器 -->
        <view class="card-wrapper">
          <!-- 建筑编号 -->
          <view class="form-item">
            <text class="form-label">建筑编号</text>
            <input
              class="form-input"
              type="text"
              placeholder="必填"
              v-model="formData.buildingCode"
            />
          </view>

          <!-- 建筑名称 -->
          <view class="form-item">
            <text class="form-label">建筑名称</text>
            <input
              class="form-input"
              type="text"
              placeholder="必填"
              v-model="formData.buildingName"
            />
          </view>

          <!-- 自动消防设施 -->
          <view class="form-item">
            <text class="form-label">自动消防设施</text>
            <view class="radio-group">
              <view class="radio-item" @tap="formData.hasFireFacilities = true">
                <view
                  class="radio-circle"
                  :class="{ active: formData.hasFireFacilities === true }"
                >
                  <view
                    class="radio-dot"
                    v-if="formData.hasFireFacilities === true"
                  ></view>
                </view>
                <text class="radio-text">有</text>
              </view>
              <view
                class="radio-item"
                @tap="formData.hasFireFacilities = false"
              >
                <view
                  class="radio-circle"
                  :class="{ active: formData.hasFireFacilities === false }"
                >
                  <view
                    class="radio-dot"
                    v-if="formData.hasFireFacilities === false"
                  ></view>
                </view>
                <text class="radio-text">无</text>
              </view>
            </view>
          </view>

          <!-- 建筑地址 -->
          <view class="form-item">
            <text class="form-label">建筑地址</text>
            <input
              class="form-input"
              type="text"
              :placeholder="defaultAddress"
              v-model="formData.address"
            />
          </view>

          <!-- 建筑类别 -->
          <view class="form-item" @tap="showTypePicker = true">
            <text class="form-label">建筑类别</text>
            <view class="form-picker">
              <text
                class="picker-value"
                :class="{ placeholder: !formData.buildingType }"
              >
                {{ formData.buildingType || "请选择" }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </view>

          <!-- 占地面积 -->
          <view class="form-item">
            <text class="form-label">占地面积(m²)</text>
            <input
              class="form-input"
              type="digit"
              placeholder="选填"
              v-model="formData.landArea"
            />
          </view>

          <!-- 建筑面积 -->
          <view class="form-item">
            <text class="form-label">建筑面积(m²)</text>
            <input
              class="form-input"
              type="digit"
              placeholder="选填"
              v-model="formData.area"
            />
          </view>

          <!-- 建筑高度 -->
          <view class="form-item">
            <text class="form-label">建筑高度(m)</text>
            <input
              class="form-input"
              type="digit"
              placeholder="必填"
              v-model="formData.buildingHeight"
            />
          </view>

          <!-- 建筑层数 -->
          <view class="form-item">
            <text class="form-label">建筑层数</text>
            <input
              class="form-input"
              type="number"
              placeholder="必填"
              v-model="formData.floors"
            />
          </view>

          <!-- 地上层数 -->
          <view class="form-item">
            <text class="form-label">地上层数</text>
            <input
              class="form-input"
              type="number"
              placeholder="必填"
              v-model="formData.aboveGroundFloors"
            />
          </view>

          <!-- 地下层数 -->
          <view class="form-item">
            <text class="form-label">地下层数</text>
            <input
              class="form-input"
              type="number"
              placeholder="选填"
              v-model="formData.undergroundFloors"
            />
          </view>

          <!-- 结构类型 -->
          <view class="form-item">
            <text class="form-label">结构类型</text>
            <input
              class="form-input"
              type="text"
              placeholder="如：钢结构、砖混"
              v-model="formData.structureType"
            />
          </view>

          <!-- 耐火等级 -->
          <view class="form-item">
            <text class="form-label">耐火等级</text>
            <input
              class="form-input"
              type="text"
              placeholder="如：一级、二级"
              v-model="formData.fireResistanceLevel"
            />
          </view>

          <!-- 防火分区数 -->
          <view class="form-item">
            <text class="form-label">防火分区数</text>
            <input
              class="form-input"
              type="number"
              placeholder="选填"
              v-model="formData.fireZoneCount"
            />
          </view>

          <!-- 安全出口 -->
          <view class="form-item">
            <text class="form-label">安全出口(个)</text>
            <input
              class="form-input"
              type="number"
              placeholder="选填"
              v-model="formData.evacuationExitCount"
            />
          </view>

          <!-- 竣工日期 -->
          <view class="form-item">
            <text class="form-label">竣工日期</text>
            <picker
              mode="date"
              class="form-picker-wrapper"
              @change="(e) => (formData.completionDate = e.detail.value)"
            >
              <view class="form-picker-value">
                <text :class="{ placeholder: !formData.completionDate }">
                  {{ formData.completionDate || "请选择" }}
                </text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>

          <!-- 经纬度 -->
          <view class="form-item">
            <text class="form-label">经度</text>
            <input
              class="form-input"
              type="digit"
              placeholder="选填"
              v-model="formData.longitude"
            />
          </view>
          <view class="form-item">
            <text class="form-label">纬度</text>
            <input
              class="form-input"
              type="digit"
              placeholder="选填"
              v-model="formData.latitude"
            />
          </view>

          <!-- 备注 -->
          <view class="form-item last">
            <text class="form-label">备注</text>
            <input
              class="form-input"
              type="text"
              placeholder="选填"
              v-model="formData.remark"
            />
          </view>
        </view>
      </scroll-view>

      <!-- 保存按钮 -->
      <view class="footer">
        <view class="save-btn" @tap="handleSave">
          <text class="save-text">保存</text>
        </view>
      </view>
    </view>

    <!-- 建筑类别选择器 -->
    <view
      class="picker-mask"
      v-if="showTypePicker"
      @tap="showTypePicker = false"
    >
      <view class="picker-container" @tap.stop>
        <view class="picker-header">
          <text class="picker-cancel" @tap="showTypePicker = false">取消</text>
          <text class="picker-title">选择建筑类别</text>
          <text class="picker-confirm" @tap="confirmType">确定</text>
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
import api from "@/api/index";
import { onMounted, ref } from "vue";

const isEdit = ref(false);
const showTypePicker = ref(false);
const typeIndex = ref(0);
const defaultAddress = "阳江市东风三路38号景湖花园";

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
  completionDate: "",
  address: "",
  longitude: "",
  latitude: "",
  remark: "",
  // 旧字段保留或备用
  hasFireFacilities: false,
  landArea: "",
  aboveGroundFloors: "",
});

// 返回上一页
const goBack = () => {
  uni.navigateBack();
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

// 表单验证
const validateForm = () => {
  if (!formData.value.buildingName || !formData.value.buildingName.trim()) {
    uni.showToast({ title: "请输入建筑名称", icon: "none" });
    return false;
  }
  if (!formData.value.buildingHeight) {
    uni.showToast({ title: "请输入建筑高度", icon: "none" });
    return false;
  }
  if (!formData.value.floors) {
    uni.showToast({ title: "请输入建筑层数", icon: "none" });
    return false;
  }
  if (!formData.value.aboveGroundFloors) {
    uni.showToast({ title: "请输入地上层数", icon: "none" });
    return false;
  }
  return true;
};

// 保存
const handleSave = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: "正在保存..." });

    // 获取当前选中的公司 ID
    const companyId = uni.getStorageSync("selectedCompanyId");
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
      area: Number(formData.value.area || 0),
      buildingHeight: Number(formData.value.buildingHeight),
      fireZoneCount: Number(formData.value.fireZoneCount || 0),
      evacuationExitCount: Number(formData.value.evacuationExitCount || 0),
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
onMounted(() => {
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
    // 新增模式：默认使用当前公司的地址
    const companyAddress = uni.getStorageSync("selectedCompanyAddress");
    if (companyAddress) {
      formData.value.address = companyAddress;
    }
  }
});
</script>

<style scoped>
.page {
  width: 100vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部导航 */
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

/* 内容区域 */
.content {
  flex: 1;
  height: calc(100vh - 180rpx);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 20rpx;
  background: #f5f5f5;
}

/* 表单内容区域 - 对应蓝色盒子 */
.content-item {
  flex: 1;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

/* 白色卡片容器 */
.card-wrapper {
  padding: 0;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.form-item.last {
  border-bottom: none;
}

.form-label {
  width: 200rpx;
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  text-align: right;
}

.form-input::placeholder {
  color: #999;
}

/* 单选组 */
.radio-group {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 40rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.radio-circle {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-circle.active {
  border-color: #e53935;
}

.radio-dot {
  width: 20rpx;
  height: 20rpx;
  background: #e53935;
  border-radius: 50%;
}

.radio-text {
  font-size: 28rpx;
  color: #333;
}

/* 选择器 */
.form-picker {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.picker-value {
  font-size: 28rpx;
  color: #333;
}

.picker-value.placeholder {
  color: #999;
}

.form-picker-wrapper {
  flex: 1;
}

.form-picker-value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.picker-arrow {
  font-size: 32rpx;
  color: #999;
  margin-left: 10rpx;
}

/* 底部保存 */
.footer {
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.save-btn {
  width: 80%;
  height: 90rpx;
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-text {
  font-size: 32rpx;
  color: #fff;
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
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.picker-container {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-cancel {
  font-size: 28rpx;
  color: #999;
}

.picker-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}

.picker-confirm {
  font-size: 28rpx;
  color: #e53935;
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
