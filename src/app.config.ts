export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/subscribe/index',
    'pages/events/index',
    'pages/briefing/index',
    'pages/mine/index',
    'pages/event-detail/index',
    'pages/materials/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E3A8A',
    navigationBarTitleText: '政务预警',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#1E3A8A',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '预警'
      },
      {
        pagePath: 'pages/subscribe/index',
        text: '词包'
      },
      {
        pagePath: 'pages/events/index',
        text: '事件'
      },
      {
        pagePath: 'pages/briefing/index',
        text: '简报'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
