const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./tests',timeout:30000,expect:{timeout:7000},fullyParallel:true,workers:2,
 forbidOnly:!!process.env.CI,retries:process.env.CI?1:0,
 reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[{name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:1000}}},{name:'mobile',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}],
 webServer:process.env.PLAYWRIGHT_BASE_URL?undefined:{command:'npm run serve',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI,timeout:10000}
});
