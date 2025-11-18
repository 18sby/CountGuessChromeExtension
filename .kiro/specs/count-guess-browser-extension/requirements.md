# 需求文档

## 简介

Count Guess是一款具有赌博风格的互动计数游戏浏览器插件。用户通过点击四个不同角色的按钮进行计数，每个角色每天最多可计数300次。插件提供人格化的角色设计、动画效果、每日重置机制和数据导出功能，纯前端实现，数据存储在本地IndexedDB中。所有用户界面文本使用英文显示。

## 术语表

- **Count Guess Plugin**: 浏览器扩展插件，提供互动计数游戏功能
- **Character**: 游戏角色，包括Sneezy Boom、Stampy Sigh、Grumble Gus和Negative Ned四个角色
- **Daily Counter**: 每个角色的每日计数值，范围0-300
- **Progress Bar**: 进度条UI组件，显示角色计数进度
- **IndexedDB**: 浏览器内置的本地数据库，用于持久化存储
- **Daily Reset**: 每日凌晨0点自动重置所有计数的机制
- **History Record**: 历史记录，存储每日各角色的计数数据
- **CSV Export**: 将历史数据导出为CSV格式文件的功能
- **Export Reminder**: 导出提醒，每月1号显示的提醒用户导出数据的通知

## Requirements

### 需求 1

**用户故事：** 作为用户，我想要看到四个不同主题颜色的角色按钮，以便选择我喜欢的角色进行互动

#### 验收标准

1. WHEN the user opens the plugin popup, THE Count Guess Plugin SHALL display four character buttons labeled "Sneezy Boom", "Stampy Sigh", "Grumble Gus", and "Negative Ned" in English
2. THE Count Guess Plugin SHALL render Sneezy Boom button with red color theme
3. THE Count Guess Plugin SHALL render Stampy Sigh button with blue color theme
4. THE Count Guess Plugin SHALL render Grumble Gus button with green color theme
5. THE Count Guess Plugin SHALL render Negative Ned button with yellow color theme

### 需求 2

**用户故事：** 作为用户，我想要点击角色按钮时增加该角色的计数，以便参与游戏互动

#### 验收标准

1. WHEN the user clicks a character button, THE Count Guess Plugin SHALL increment that character's daily counter by 1
2. WHEN the user clicks a character button, THE Count Guess Plugin SHALL update the progress bar to reflect the new count value
3. WHEN the user clicks a character button, THE Count Guess Plugin SHALL play a scale animation effect on the button
4. WHEN a character's daily counter reaches 300, THE Count Guess Plugin SHALL disable that character's button for the remainder of the day
5. WHEN a character's daily counter reaches 300, THE Count Guess Plugin SHALL display a flashing animation effect on that character's button

### 需求 3

**用户故事：** 作为用户，我想要看到每个角色的实时进度条，以便了解当前计数进度

#### 验收标准

1. THE Count Guess Plugin SHALL display a progress bar for each character below its button
2. WHEN a character's counter updates, THE Count Guess Plugin SHALL animate the progress bar with a smooth gradient transition
3. THE Count Guess Plugin SHALL calculate progress bar fill percentage as (current count / 300) × 100%
4. THE Count Guess Plugin SHALL render each progress bar with its corresponding character's theme color
5. THE Count Guess Plugin SHALL display the current count value numerically alongside the progress bar

### 需求 4

**用户故事：** 作为用户，我想要系统每天自动重置所有计数，以便每天都能重新开始游戏

#### 验收标准

1. WHEN the system time reaches 00:00:00 local time, THE Count Guess Plugin SHALL reset all character counters to 0
2. WHEN the daily reset occurs, THE Count Guess Plugin SHALL save the previous day's counter values to the history records
3. WHEN the daily reset occurs, THE Count Guess Plugin SHALL reset all progress bars to 0% with a fade-out and fade-in animation
4. WHEN the daily reset occurs, THE Count Guess Plugin SHALL re-enable all character buttons
5. WHEN the user opens the plugin after a daily reset, THE Count Guess Plugin SHALL display the reset state immediately

### 需求 5

**用户故事：** 作为用户，我想要将历史数据导出为CSV文件，以便保存和分析我的游戏记录

#### 验收标准

1. THE Count Guess Plugin SHALL display an "Export Data" button with English text in the popup interface
2. WHEN the user clicks the "Export Data" button, THE Count Guess Plugin SHALL generate a CSV file containing all history records
3. THE Count Guess Plugin SHALL format the CSV file with English column headers: Date, Sneezy Boom, Stampy Sigh, Grumble Gus, Negative Ned
4. THE Count Guess Plugin SHALL include each historical day's date and counter values for all characters in the CSV file
5. WHEN the CSV file is generated, THE Count Guess Plugin SHALL trigger a browser download of the file
6. WHEN the 1st day of any month arrives, THE Count Guess Plugin SHALL display an export reminder notification with English text in the popup interface
7. THE Count Guess Plugin SHALL display the export reminder for a maximum of 7 days after the 1st of the month
8. WHEN the user successfully exports data, THE Count Guess Plugin SHALL dismiss the export reminder notification
9. WHEN 7 days have passed since the 1st of the month, THE Count Guess Plugin SHALL automatically dismiss the export reminder notification

### 需求 6

**用户故事：** 作为用户，我想要所有数据存储在本地，以便保护隐私且无需网络连接

#### 验收标准

1. THE Count Guess Plugin SHALL use IndexedDB to store all counter data locally in the browser
2. THE Count Guess Plugin SHALL store daily counter values with the date, character name, and count value
3. THE Count Guess Plugin SHALL store historical records for all previous days
4. THE Count Guess Plugin SHALL retrieve stored data when the plugin popup is opened
5. THE Count Guess Plugin SHALL function without any network connection or backend server

### 需求 7

**用户故事：** 作为用户，我想要流畅的动画效果，以便获得更好的视觉体验

#### 验收标准

1. WHEN the user clicks a character button, THE Count Guess Plugin SHALL complete the scale animation within 300 milliseconds
2. WHEN a progress bar updates, THE Count Guess Plugin SHALL complete the gradient transition animation within 300 milliseconds
3. WHEN the daily reset occurs, THE Count Guess Plugin SHALL complete the fade-out and fade-in animation within 500 milliseconds
4. THE Count Guess Plugin SHALL implement all animations using CSS transitions or animations
5. THE Count Guess Plugin SHALL ensure animations consume minimal CPU and memory resources

### 需求 8

**用户故事：** 作为用户，我想要插件兼容Chrome浏览器，以便在我的浏览器中正常使用

#### 验收标准

1. THE Count Guess Plugin SHALL include a valid manifest.json file conforming to Chrome Extension Manifest V3 specification
2. THE Count Guess Plugin SHALL function correctly on the latest stable version of Chrome browser
3. THE Count Guess Plugin SHALL implement a responsive popup interface that adapts to different window sizes
4. THE Count Guess Plugin SHALL load all resources (HTML, CSS, JavaScript) from the local extension package
5. THE Count Guess Plugin SHALL not exceed 5MB in total package size
