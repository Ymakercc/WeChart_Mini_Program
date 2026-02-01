<template>
  <view class="page">
    <!-- 使用 uni-nav-bar 自定义导航栏 -->
    <uni-nav-bar
      class="custom-nav"
      fixed
      status-bar
      left-icon="back"
      title="设备管理"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    >
      <!-- <template #right>
        <view class="nav-right" @tap="goAdd">
          <uni-icons type="plusempty" size="24" color="#ffffff" />
        </view>
      </template> -->
    </uni-nav-bar>

    <!-- 内容区域/分组列表 -->
    <scroll-view class="content" scroll-y>
      <view class="type-list">
        <view
          class="type-item"
          v-for="group in groupedEquipment"
          :key="group.type"
          @tap="goTypeList(group)"
        >
          <text class="type-name">{{ group.typeName || group.type }}</text>
          <view class="type-right">
            <text class="type-count">{{ group.count }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view
        class="empty-state"
        v-if="groupedEquipment.length === 0 && !loading"
      >
        <text class="empty-text">暂无数据</text>
      </view>
    </scroll-view>

    <!-- 添加按钮 -->
    <view class="add-btn" @tap="goAdd">
      <text class="add-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { computed, onMounted, onUnmounted, ref } from "vue";

const equipmentList = ref([]);
const loading = ref(false);

// 按设备类型分组（使用 systemName 字段）
const groupedEquipment = computed(() => {
  const groups = {};

  equipmentList.value.forEach((item) => {
    // 优先使用 systemName 作为分组依据
    const type =
      item.systemName || item.equipmentType || item.systemType || "其他";
    const typeName = type; // systemName 本身就是名称

    if (!groups[type]) {
      groups[type] = {
        type: type,
        typeName: typeName,
        count: 0,
        items: [],
      };
    }
    groups[type].count++;
    groups[type].items.push(item);
  });

  return Object.values(groups).sort((a, b) => b.count - a.count);
});

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转到添加页面
const goAdd = () => {
  uni.navigateTo({
    url: "/pages/equipment/form",
  });
};

// 跳转到某类型的设备列表
const goTypeList = (group) => {
  // 存储该类型的设备列表
  uni.setStorageSync("currentTypeEquipments", group.items);
  uni.navigateTo({
    url: `/pages/equipment/list?type=${encodeURIComponent(
      group.type,
    )}&typeName=${encodeURIComponent(group.typeName)}`,
  });
};

// 加载设备列表
const loadEquipmentList = async () => {
  try {
    loading.value = true;
    const companyId = uni.getStorageSync("selectedCompanyId");
    if (!companyId) {
      uni.showToast({ title: "请先选择公司", icon: "none" });
      return;
    }

    const res = await api.getEquipmentList({
      companyId: companyId,
      buildingId: "",
      equipmentType: "",
      status: "",
      pageNum: 1,
      pageSize: 500,
    });

    if (res.code === 200 || res.code === 0) {
      const data = res.rows || res.data || [];
      equipmentList.value = Array.isArray(data)
        ? data
        : data.rows || data.list || [];
    } else {
      equipmentList.value = [];
    }
  } catch (e) {
    console.error("获取设备列表失败:", e);
    uni.showToast({ title: "获取设备列表失败", icon: "none" });
    equipmentList.value = [];
  } finally {
    loading.value = false;
  }
};

// 刷新列表的事件处理函数
const handleRefresh = () => {
  loadEquipmentList();
};

onMounted(() => {
  loadEquipmentList();
  uni.$on("refreshEquipmentList", handleRefresh);
});

onUnmounted(() => {
  uni.$off("refreshEquipmentList", handleRefresh);
});
</script>

<style scoped>
.page {
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-right {
  padding: 0 20rpx;
}

/* 内容区域 */
.content {
  padding-right: 20rpx;
  padding-left: 20rpx;
  flex: 1;
  padding-top: calc(16px + env(safe-area-inset-top));
  box-sizing: border-box;
}

/* 类型列表 */
.type-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-top: 20rpx;
}

.type-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 30rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.type-item:active {
  background: #f5f5f5;
}

.type-name {
  font-size: 30rpx;
  color: #333;
}

.type-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.type-count {
  font-size: 28rpx;
  color: #999;
}

.arrow {
  font-size: 32rpx;
  color: #ccc;
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 添加按钮 */
.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(229, 57, 53, 0.4);
  z-index: 100;
}

.add-icon {
  font-size: 56rpx;
  color: #fff;
  font-weight: 300;
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
</style>
