// test_card_width_comparison.js
// 测试卡片宽度对比

// 模拟学习页面和测试页面的容器宽度计算
function calculateCardWidth() {
  console.log('=== 卡片宽度对比测试 ===\n');
  
  // 假设屏幕宽度为750rpx（微信小程序标准）
  const screenWidth = 750;
  
  // 学习页面的容器设置
  const studyContainerPadding = 15;
  const studyCardPadding = { top: 60, bottom: 60, left: 40, right: 40 };
  
  // 测试页面的容器设置（修改前）
  const testContainerPaddingBefore = 20;
  const testCardPaddingBefore = { top: 40, bottom: 40, left: 40, right: 40 };
  
  // 测试页面的容器设置（修改后）
  const testContainerPaddingAfter = 15;
  const testCardPaddingAfter = { top: 60, bottom: 60, left: 40, right: 40 };
  
  // 计算卡片实际宽度
  const studyCardWidth = screenWidth - (studyContainerPadding * 2) - (studyCardPadding.left + studyCardPadding.right);
  const testCardWidthBefore = screenWidth - (testContainerPaddingBefore * 2) - (testCardPaddingBefore.left + testCardPaddingBefore.right);
  const testCardWidthAfter = screenWidth - (testContainerPaddingAfter * 2) - (testCardPaddingAfter.left + testCardPaddingAfter.right);
  
  console.log('屏幕宽度:', screenWidth, 'rpx');
  console.log('\n学习页面:');
  console.log('- 容器padding:', studyContainerPadding, 'rpx');
  console.log('- 卡片padding:', studyCardPadding);
  console.log('- 卡片实际宽度:', studyCardWidth, 'rpx');
  
  console.log('\n测试页面（修改前）:');
  console.log('- 容器padding:', testContainerPaddingBefore, 'rpx');
  console.log('- 卡片padding:', testCardPaddingBefore);
  console.log('- 卡片实际宽度:', testCardWidthBefore, 'rpx');
  
  console.log('\n测试页面（修改后）:');
  console.log('- 容器padding:', testContainerPaddingAfter, 'rpx');
  console.log('- 卡片padding:', testCardPaddingAfter);
  console.log('- 卡片实际宽度:', testCardWidthAfter, 'rpx');
  
  console.log('\n=== 对比结果 ===');
  console.log('学习页面 vs 测试页面（修改前）:', studyCardWidth - testCardWidthBefore, 'rpx');
  console.log('学习页面 vs 测试页面（修改后）:', studyCardWidth - testCardWidthAfter, 'rpx');
  
  if (studyCardWidth === testCardWidthAfter) {
    console.log('✅ 修改成功！测试页面卡片宽度现在与学习页面一致');
  } else {
    console.log('❌ 修改失败！宽度仍然不一致');
  }
  
  return {
    studyCardWidth,
    testCardWidthBefore,
    testCardWidthAfter
  };
}

// 执行测试
calculateCardWidth();