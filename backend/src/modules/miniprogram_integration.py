"""
小程序集成模块
负责小程序数据更新检测和本地存储更新
"""

import json
import os
import logging
from datetime import datetime
from typing import Dict, List, Optional
import requests

logger = logging.getLogger(__name__)


class MiniProgramUpdateDetector:
    """小程序更新检测器"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.update_url = config.get('miniprogram', {}).get('update_url', '')
        self.data_version = config.get('miniprogram', {}).get('data_version', '')
    
    def check_for_updates(self) -> Optional[Dict]:
        """检查是否有数据更新"""
        try:
            if not self.update_url:
                logger.warning("未配置更新URL")
                return None
            
            logger.info("检查数据更新...")
            response = requests.get(self.update_url, timeout=30)
            response.raise_for_status()
            
            update_data = response.json()
            
            # 检查版本
            if self._is_new_version(update_data.get('version', '')):
                logger.info(f"发现新版本数据: {update_data['version']}")
                return update_data
            else:
                logger.info("数据已是最新版本")
                return None
                
        except Exception as e:
            logger.error(f"检查更新失败: {e}")
            return None
    
    def _is_new_version(self, server_version: str) -> bool:
        """检查是否为新版本"""
        if not server_version:
            return False
        
        # 简单的版本比较（可以根据需要改进）
        return server_version > self.data_version
    
    def download_update(self, update_data: Dict) -> bool:
        """下载更新数据"""
        try:
            # 验证更新数据
            if not self._validate_update_data(update_data):
                logger.error("更新数据验证失败")
                return False
            
            # 保存更新数据
            update_file = os.path.join('data', 'latest_update.json')
            os.makedirs(os.path.dirname(update_file), exist_ok=True)
            
            with open(update_file, 'w', encoding='utf-8') as f:
                json.dump(update_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"更新数据已下载: {update_file}")
            return True
            
        except Exception as e:
            logger.error(f"下载更新失败: {e}")
            return False
    
    def _validate_update_data(self, update_data: Dict) -> bool:
        """验证更新数据"""
        required_fields = ['version', 'papers', 'vocabulary', 'timestamp']
        for field in required_fields:
            if field not in update_data:
                logger.error(f"更新数据缺少字段: {field}")
                return False
        
        return True


class MiniProgramDataUpdater:
    """小程序数据更新器"""
    
    def __init__(self, miniprogram_path: str):
        self.miniprogram_path = miniprogram_path
        # 如果路径已经包含utils，直接使用；否则添加utils
        if miniprogram_path.endswith("utils"):
            self.papers_data_file = os.path.join(miniprogram_path, "papersData.js")
        else:
            self.papers_data_file = os.path.join(miniprogram_path, "utils", "papersData.js")
        self.vocabulary_storage_key = "words"
        self.version_storage_key = "dataVersion"
    
    def update_papers_data(self, new_papers: List[Dict]) -> bool:
        """更新论文数据"""
        try:
            if not os.path.exists(self.papers_data_file):
                logger.error(f"论文数据文件不存在: {self.papers_data_file}")
                return False
            
            # 读取现有论文数据
            with open(self.papers_data_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 找到papers数组的结束位置
            papers_end = content.rfind(']')
            if papers_end == -1:
                logger.error("未找到papers数组结束位置")
                return False
            
            # 构建新论文数据
            new_papers_js = []
            for paper in new_papers:
                paper_js = self._convert_paper_to_js(paper)
                new_papers_js.append(paper_js)
            
            # 插入新论文数据
            new_content = content[:papers_end] + ',\n\n' + ',\n\n'.join(new_papers_js) + '\n' + content[papers_end:]
            
            # 写回文件
            with open(self.papers_data_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            logger.info(f"成功更新 {len(new_papers)} 篇论文数据")
            return True
            
        except Exception as e:
            logger.error(f"更新论文数据失败: {e}")
            return False
    
    def _convert_paper_to_js(self, paper: Dict) -> str:
        """将论文数据转换为JavaScript格式"""
        def escape_js_string(text):
            if not text:
                return ""
            return str(text).replace('\\', '\\\\').replace('`', '\\`').replace('$', '\\$')
        
        js_template = f"""  {{
    id: {paper['id']},
    title: '{escape_js_string(paper['title'])}',
    authors: '{escape_js_string(paper['authors'])}',
    year: {paper['year']},
    journal: '{escape_js_string(paper['journal'])}',
    abstract: '{escape_js_string(paper['abstract'])}',
    url: '{escape_js_string(paper['url'])}',
    get wordCount() {{ return getPaperWordCount('{escape_js_string(paper['title'])}') }},
    category: '{escape_js_string(paper['category'])}',
    background: `{escape_js_string(paper['background'])}`,
    keyConcepts: `{escape_js_string(paper['keyConcepts'])}`,
    highlights: `{escape_js_string(paper['highlights'])}`
  }}"""
        return js_template
    
    def create_vocabulary_update_script(self, vocabulary_data: List[Dict], output_path: str) -> bool:
        """创建词汇更新脚本"""
        try:
            script_content = self._generate_vocabulary_update_script(vocabulary_data)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(script_content)
            
            logger.info(f"词汇更新脚本已创建: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"创建词汇更新脚本失败: {e}")
            return False
    
    def _generate_vocabulary_update_script(self, vocabulary_data: List[Dict]) -> str:
        """生成词汇更新脚本"""
        script = """// 词汇数据更新脚本
// 自动生成于: {timestamp}

const VocabularyManager = require('./vocabularyManager.js');

// 新词汇数据
const newVocabularyData = {vocabulary_data};

// 更新函数
function updateVocabulary() {{
    try {{
        const vocabularyManager = new VocabularyManager();
        
        // 添加新词汇
        const result = vocabularyManager.addNewWords(newVocabularyData);
        
        console.log('词汇更新完成:', result);
        
        // 显示更新结果
        wx.showToast({{
            title: `更新了${{result.added}}个词汇`,
            icon: 'success'
        }});
        
        return true;
    }} catch (error) {{
        console.error('词汇更新失败:', error);
        wx.showToast({{
            title: '更新失败',
            icon: 'error'
        }});
        return false;
    }}
}}

// 导出更新函数
module.exports = {{
    updateVocabulary: updateVocabulary,
    newVocabularyData: newVocabularyData
}};
""".format(
            timestamp=datetime.now().isoformat(),
            vocabulary_data=json.dumps(vocabulary_data, ensure_ascii=False, indent=2)
        )
        
        return script


class MiniProgramIntegrationManager:
    """小程序集成管理器"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.update_detector = MiniProgramUpdateDetector(config)
        self.data_updater = MiniProgramDataUpdater(
            config.get('miniprogram', {}).get('data_path', '../utils/')
        )
    
    def process_update(self, update_data: Dict) -> bool:
        """处理数据更新"""
        try:
            logger.info("开始处理数据更新...")
            
            # 更新论文数据
            papers_success = True
            if update_data.get('papers'):
                papers_success = self.data_updater.update_papers_data(update_data['papers'])
            
            # 创建词汇更新脚本
            vocabulary_success = True
            if update_data.get('vocabulary'):
                script_path = os.path.join(
                    self.config.get('miniprogram', {}).get('data_path', '../utils/'),
                    'vocabulary_update.js'
                )
                vocabulary_success = self.data_updater.create_vocabulary_update_script(
                    update_data['vocabulary'], script_path
                )
            
            # 更新版本信息
            version_success = self._update_version_info(update_data.get('version', ''))
            
            if papers_success and vocabulary_success and version_success:
                logger.info("数据更新处理完成")
                return True
            else:
                logger.error("数据更新处理失败")
                return False
                
        except Exception as e:
            logger.error(f"处理数据更新失败: {e}")
            return False
    
    def _update_version_info(self, version: str) -> bool:
        """更新版本信息"""
        try:
            version_file = os.path.join(
                self.config.get('miniprogram', {}).get('data_path', '../utils/'),
                'version.json'
            )
            
            version_info = {
                "version": version,
                "updated_at": datetime.now().isoformat(),
                "update_source": "backend_system"
            }
            
            with open(version_file, 'w', encoding='utf-8') as f:
                json.dump(version_info, f, ensure_ascii=False, indent=2)
            
            logger.info(f"版本信息已更新: {version}")
            return True
            
        except Exception as e:
            logger.error(f"更新版本信息失败: {e}")
            return False
    
    def create_miniprogram_update_code(self, output_path: str) -> bool:
        """创建小程序更新代码"""
        try:
            update_code = self._generate_miniprogram_update_code()
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(update_code)
            
            logger.info(f"小程序更新代码已创建: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"创建小程序更新代码失败: {e}")
            return False
    
    def _generate_miniprogram_update_code(self) -> str:
        """生成小程序更新代码"""
        code = """// 小程序数据更新代码
// 自动生成于: {timestamp}

App({{
  globalData: {{
    dataVersion: '{data_version}',
    updateUrl: '{update_url}'
  }},
  
  onLaunch() {{
    // 检查数据更新
    this.checkDataUpdate();
  }},
  
  checkDataUpdate() {{
    const currentVersion = wx.getStorageSync('dataVersion') || '0';
    const serverVersion = this.globalData.dataVersion;
    
    if (currentVersion < serverVersion) {{
      console.log('发现新版本数据，开始更新...');
      this.downloadDataUpdate();
    }} else {{
      console.log('数据已是最新版本');
    }}
  }},
  
  downloadDataUpdate() {{
    wx.request({{
      url: this.globalData.updateUrl,
      method: 'GET',
      success: (res) => {{
        if (res.statusCode === 200) {{
          this.updateLocalData(res.data);
        }}
      }},
      fail: (err) => {{
        console.error('数据更新失败:', err);
        wx.showToast({{
          title: '更新失败',
          icon: 'error'
        }});
      }}
    }});
  }},
  
  updateLocalData(newData) {{
    try {{
      // 更新论文数据
      if (newData.papers && newData.papers.length > 0) {{
        const existingPapers = wx.getStorageSync('papers') || [];
        const updatedPapers = this.mergePapers(existingPapers, newData.papers);
        wx.setStorageSync('papers', updatedPapers);
        console.log(`更新了 ${{newData.papers.length}} 篇论文`);
      }}
      
      // 更新词汇数据
      if (newData.vocabulary && newData.vocabulary.length > 0) {{
        const existingWords = wx.getStorageSync('words') || [];
        const updatedWords = this.mergeVocabulary(existingWords, newData.vocabulary);
        wx.setStorageSync('words', updatedWords);
        console.log(`更新了 ${{newData.vocabulary.length}} 个词汇`);
      }}
      
      // 更新版本号
      wx.setStorageSync('dataVersion', newData.version);
      
      // 显示更新成功提示
      wx.showToast({{
        title: '数据更新成功',
        icon: 'success'
      }});
      
    }} catch (error) {{
      console.error('本地数据更新失败:', error);
      wx.showToast({{
        title: '数据更新失败',
        icon: 'error'
      }});
    }}
  }},
  
  mergePapers(existingPapers, newPapers) {{
    // 基于ID进行合并，新论文追加到列表
    const existingIds = new Set(existingPapers.map(p => p.id));
    const uniqueNewPapers = newPapers.filter(p => !existingIds.has(p.id));
    const mergedPapers = [...existingPapers, ...uniqueNewPapers];
    
    // 按照发表时间由近到远排序（最新发表的论文排在最上面）
    // 同年发表的论文按标题字母顺序排序
    return mergedPapers.sort((a, b) => {{
      // 首先按年份排序（由近到远）
      if (b.year !== a.year) {{
        return b.year - a.year;
      }}
      // 同年发表的论文按标题字母顺序排序
      return a.title.localeCompare(b.title);
    }});
  }},
  
  mergeVocabulary(existingWords, newWords) {{
    // 基于词汇文本去重，保留用户学习进度
    const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()));
    const uniqueNewWords = newWords.filter(word => 
      !existingWordSet.has(word.word.toLowerCase())
    );
    return [...existingWords, ...uniqueNewWords];
  }}
}});
""".format(
            timestamp=datetime.now().isoformat(),
            data_version=self.config.get('miniprogram', {}).get('data_version', ''),
            update_url=self.config.get('miniprogram', {}).get('update_url', '')
        )
        
        return code