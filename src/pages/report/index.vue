<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <uni-nav-bar
      class="custom-nav"
      fixed
      status-bar
      left-icon="back"
      title="维保报告"
      background-color="#e53935"
      color="#ffffff"
      @clickLeft="goBack"
    />

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y @scrolltolower="loadMore">
      <view
        class="report-card"
        v-for="item in reportList"
        :key="item.reportId"
        @tap="handlePreview(item)"
      >
        <view class="card-header">
          <text class="report-name text-ellipsis">{{ item.reportName }}</text>
        </view>
        <view class="card-content">
          <view class="info-row">
            <view class="info-item">
              <text class="info-label">关联任务:</text>
              <text class="info-value">{{ item.taskName || "无" }}</text>
            </view>
          </view>
          <view class="info-row">
            <view class="info-item">
              <text class="info-label">维保单位:</text>
              <text class="info-value">{{ item.companyName || "无" }}</text>
            </view>
          </view>
          <view class="info-row">
            <view class="info-item">
              <text class="info-label">文件大小:</text>
              <text class="info-value">{{
                formatFileSize(item.fileSize)
              }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">生成时间:</text>
              <text class="info-value">{{ formatDate(item.createTime) }}</text>
            </view>
          </view>
          <view class="card-footer">
            <view class="btn-group">
              <view class="btn-item btn-preview-text">
                <uni-icons type="eye" size="18" color="#e53935"></uni-icons>
                <text class="btn-text">预览</text>
              </view>
              <view
                class="btn-item btn-download"
                @tap.stop="handleDownload(item)"
              >
                <uni-icons type="download" size="18" color="#fff"></uni-icons>
                <text class="btn-text-white">下载</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="reportList.length === 0 && !loading">
        <text class="empty-text">暂无维保报告</text>
      </view>

      <!-- 加载中状态 -->
      <view class="loading-state" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import api from "@/api/index";
import { onMounted, ref } from "vue";

const reportList = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = 10;
const total = ref(0);
const currentCompanyId = ref(null);

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return "--";
  return dateStr.substring(0, 16);
};

// 加载当前公司
const loadCurrentCompany = async () => {
  try {
    const res = await api.getCurrentCompany();
    if ((res.code === 200 || res.code === 0) && res.data) {
      currentCompanyId.value = res.data.companyId;
      return res.data.companyId;
    }
  } catch (e) {
    console.error("获取当前公司失败:", e);
  }
  return null;
};

// 加载列表数据
const loadData = async (refresh = false) => {
  if (loading.value) return;
  if (refresh) {
    pageNum.value = 1;
    reportList.value = [];
  }

  loading.value = true;
  try {
    if (!currentCompanyId.value) {
      await loadCurrentCompany();
    }

    if (!currentCompanyId.value) {
      uni.showToast({ title: "请先选择公司", icon: "none" });
      return;
    }

    const res = await api.getReportList({
      companyId: currentCompanyId.value,
      reportName: "",
      params: {
        beginTime: "",
        endTime: "",
      },
      pageNum: pageNum.value,
      pageSize: pageSize,
    });

    if (res.code === 200 || res.code === 0) {
      const rows = res.rows || [];
      if (refresh) {
        reportList.value = rows;
      } else {
        reportList.value = [...reportList.value, ...rows];
      }
      total.value = res.total || 0;
    }
  } catch (e) {
    console.error("获取报告列表失败:", e);
    uni.showToast({ title: "获取列表失败", icon: "none" });
  } finally {
    loading.value = false;
  }
};

// 触底加载更多
const loadMore = () => {
  if (reportList.value.length < total.value) {
    pageNum.value++;
    loadData();
  }
};

// 预览报告（在小程序中打开）
const handlePreview = async (item) => {
  uni.showLoading({ title: "正在加载预览..." });

  try {
    // 使用预览接口
    const previewUrl = `${api.BASE_URL}${api.getReportPreviewUrl(item.reportId)}`;
    // 指定本地存储路径以保留文件名
    const filePath = `${uni.env.USER_DATA_PATH}/${item.reportName}`;

    uni.downloadFile({
      url: previewUrl,
      filePath: filePath,
      header: {
        Authorization: api.getToken() ? `Bearer ${api.getToken()}` : "",
      },
      success: (res) => {
        if (res.statusCode === 200 || res.errMsg.includes("ok")) {
          // 使用下载后的路径直接打开
          uni.openDocument({
            filePath: filePath,
            showMenu: true,
            success: () => {
              console.log("预览成功");
            },
            fail: (err) => {
              uni.showToast({ title: "预览失败", icon: "none" });
              console.error("预览失败:", err);
            },
          });
        } else {
          uni.showToast({ title: "预览请求失败", icon: "none" });
        }
      },
      fail: (err) => {
        uni.showToast({ title: "预览下载失败", icon: "none" });
        console.error("预览下载失败:", err);
      },
      complete: () => {
        uni.hideLoading();
      },
    });
  } catch (e) {
    uni.hideLoading();
    console.error("预览异常:", e);
    uni.showToast({ title: "预览异常", icon: "none" });
  }
};

// 下载报告
const handleDownload = async (item) => {
  uni.showLoading({ title: "准备下载..." });

  try {
    // 使用下载接口
    const downloadUrl = `${api.BASE_URL}${api.getReportDownloadUrl(item.reportId)}`;
    const filePath = `${uni.env.USER_DATA_PATH}/${item.reportName}`;

    uni.downloadFile({
      url: downloadUrl,
      filePath: filePath,
      header: {
        Authorization: api.getToken() ? `Bearer ${api.getToken()}` : "",
      },
      success: (res) => {
        if (res.statusCode === 200 || res.errMsg.includes("ok")) {
          uni.showActionSheet({
            itemList: ["保存到本地", "直接打开"],
            success: (action) => {
              if (action.tapIndex === 0) {
                // 在小程序中，saveFile 会把文件移动到持久存储中，文件名可能会变
                // 但如果已经用 filePath 下载了，它就在 USER_DATA_PATH 下了
                uni.saveFile({
                  tempFilePath: filePath,
                  success: (saveRes) => {
                    uni.showModal({
                      title: "下载成功",
                      content: "文件已保存，路径：" + saveRes.savedFilePath,
                      showCancel: false,
                    });
                  },
                });
              } else {
                uni.openDocument({
                  filePath: filePath,
                  showMenu: true,
                });
              }
            },
          });
        } else {
          uni.showToast({ title: "下载失败", icon: "none" });
        }
      },
      fail: (err) => {
        uni.showToast({ title: "任务开启失败", icon: "none" });
        console.error("下载失败:", err);
      },
      complete: () => {
        uni.hideLoading();
      },
    });
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: "下载异常", icon: "none" });
  }
};

onMounted(() => {
  loadData(true);
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

/* 内容区域 */
.content {
  flex: 1;
  padding: 20rpx;
  padding-top: calc(16px + env(safe-area-inset-top));
  box-sizing: border-box;
}

.report-card {
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  padding: 20rpx 30rpx;
}

.report-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}

.text-ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.card-content {
  padding: 20rpx 30rpx;
}

.info-row {
  display: flex;
  margin-bottom: 16rpx;
}

.info-row:last-child {
  margin-bottom: 16rpx;
}

.info-item {
  flex: 1;
  display: flex;
  align-items: center;
}

.info-label {
  font-size: 26rpx;
  color: #666;
  margin-right: 10rpx;
  white-space: nowrap;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  word-break: break-all;
}

.card-footer {
  border-top: 1rpx solid #eee;
  padding-top: 20rpx;
  margin-top: 10rpx;
}

.btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

.btn-item {
  display: flex;
  align-items: center;
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.btn-preview-text {
  border: 1rpx solid #e53935;
  color: #e53935;
}

.btn-download {
  background: linear-gradient(135deg, #e53935 0%, #ef5350 100%);
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(229, 57, 53, 0.2);
}

.btn-text {
  margin-left: 8rpx;
}

.btn-text-white {
  color: #fff;
  margin-left: 8rpx;
}

/* 状态样式 */
.empty-state,
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.empty-text,
.loading-text {
  font-size: 28rpx;
  color: #999;
}

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
</style>
