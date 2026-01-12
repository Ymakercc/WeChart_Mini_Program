<template>
  <view class="drawer-mask" v-if="visible" @tap="closeDrawer">
    <view class="drawer-container" @tap.stop>
      <!-- 标题栏 -->
      <view class="drawer-header">
        <text class="drawer-title">请选择公司</text>
      </view>

      <!-- 搜索框 -->
      <view class="search-box">
        <input
          class="search-input"
          type="text"
          placeholder="请输入关键字"
          v-model="searchKeyword"
          @input="handleSearch"
        />
      </view>

      <!-- 公司列表 -->
      <scroll-view class="company-list" scroll-y>
        <view
          class="company-item"
          v-for="item in filteredCompanyList"
          :key="item.id"
          @tap="selectCompany(item)"
        >
          <view class="company-name">{{ item.name }}</view>
          <view class="company-address">{{ item.address }}</view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="filteredCompanyList.length === 0">
          <text class="empty-text">暂无匹配的公司</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { getMyCompanyList } from "@/api";
import { computed, ref, watch } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "select"]);

const searchKeyword = ref("");
const companyList = ref([]);
const loading = ref(false);

// 根据搜索关键字过滤公司列表
const filteredCompanyList = computed(() => {
  if (!searchKeyword.value.trim()) {
    return companyList.value || [];
  }
  const keyword = searchKeyword.value.trim().toLowerCase();
  return (companyList.value || []).filter((item) => {
    const name = (item.name || "").toLowerCase();
    const address = (item.address || "").toLowerCase();
    return name.includes(keyword) || address.includes(keyword);
  });
});

// 搜索处理
const handleSearch = () => {
  // 搜索由 computed 自动处理
};

// 选择公司
const selectCompany = (company) => {
  emit("select", company);
  closeDrawer();
};

// 关闭抽屉
const closeDrawer = () => {
  emit("close");
};

// 加载公司列表
const loadCompanyList = async () => {
  loading.value = true;
  try {
    const res = await getMyCompanyList();
    if ((res.code === 200 || res.code === 0) && res.data) {
      companyList.value = res.data.map((item) => ({
        companyId: item.companyId,
        id: item.companyId,
        name: item.companyName || item.name || "未命名公司",
        address: item.address || "暂无地址",
      }));
    }
  } catch (e) {
    console.error("获取公司列表失败:", e);
    uni.showToast({ title: "获取公司列表失败", icon: "none" });
  } finally {
    loading.value = false;
  }
};

// 监听抽屉打开，加载数据
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      searchKeyword.value = "";
      loadCompanyList();
    }
  }
);
</script>

<style scoped>
.drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.drawer-container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 65%;
  background: #fff;
  display: flex;
  flex-direction: column;
  animation: slideLeft 0.3s ease;
}

@keyframes slideLeft {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.drawer-header {
  background: linear-gradient(135deg, #ea4542 0%, #f15d5d 100%);
  padding: 60rpx 30rpx 30rpx;
  padding-top: calc(60rpx + env(safe-area-inset-top));
  text-align: center;
}

.drawer-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
}

.search-box {
  padding: 20rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.search-input {
  width: 100%;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #333;
}

.company-list {
  flex: 1;
  height: 0;
}

.company-item {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: #fff;
  transition: background 0.2s;
}

.company-item:active {
  background: #f5f5f5;
}

.company-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 10rpx;
  line-height: 1.4;
}

.company-address {
  font-size: 24rpx;
  color: #999;
  line-height: 1.4;
}

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
</style>
