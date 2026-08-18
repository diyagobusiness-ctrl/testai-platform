'use client'

import { useState, useRef, useCallback } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Sun, Moon, Minus, Plus, RotateCcw } from 'lucide-react'

export type Language = 'javascript' | 'python' | 'java' | 'cpp'
export type Theme = 'vs-dark' | 'vs-light'

interface BoilerplateCode {
  javascript: string
  python: string
  java: string
  cpp: string
}

const defaultBoilerplate: BoilerplateCode = {
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here
    
}

// Test cases
console.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]
console.log(twoSum([3, 2, 4], 6)); // Expected: [1, 2]
`,
  python: `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your solution here
        pass

# Test cases
sol = Solution()
print(sol.twoSum([2, 7, 11, 15], 9))  # Expected: [0, 1]
print(sol.twoSum([3, 2, 4], 6))  # Expected: [1, 2]
`,
  java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(Arrays.toString(sol.twoSum(new int[]{2, 7, 11, 15}, 9)));
        System.out.println(Arrays.toString(sol.twoSum(new int[]{3, 2, 4}, 6)));
    }
}
`,
  cpp: `#include <vector>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};

int main() {
    Solution sol;
    vector<int> nums1 = {2, 7, 11, 15};
    vector<int> result1 = sol.twoSum(nums1, 9);
    for (int num : result1) cout << num << " ";
    cout << endl;
    return 0;
}
`,
}

const languageLabels: Record<Language, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
}

const languages: Language[] = ['javascript', 'python', 'java', 'cpp']

interface CodeEditorProps {
  initialCode?: string
  language?: Language
  theme?: Theme
  onCodeChange?: (code: string) => void
  onLanguageChange?: (language: Language) => void
  onThemeChange?: (theme: Theme) => void
  className?: string
}

export function CodeEditor({
  initialCode,
  language = 'javascript',
  theme = 'vs-dark',
  onCodeChange,
  onLanguageChange,
  onThemeChange,
  className,
}: CodeEditorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(language)
  const [currentTheme, setCurrentTheme] = useState<Theme>(theme)
  const [fontSize, setFontSize] = useState(14)
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const [code, setCode] = useState(initialCode || defaultBoilerplate[language])

  const handleEditorMount: OnMount = useCallback((editor) => {
    editorRef.current = editor
  }, [])

  const handleLanguageChange = (newLanguage: Language) => {
    setCurrentLanguage(newLanguage)
    if (!initialCode) {
      setCode(defaultBoilerplate[newLanguage])
    }
    onLanguageChange?.(newLanguage)
  }

  const handleThemeChange = () => {
    const newTheme = currentTheme === 'vs-dark' ? 'vs-light' : 'vs-dark'
    setCurrentTheme(newTheme)
    onThemeChange?.(newTheme)
  }

  const handleFontSizeChange = (delta: number) => {
    setFontSize((prev) => Math.min(Math.max(prev + delta, 12), 24))
  }

  const handleReset = () => {
    const newCode = initialCode || defaultBoilerplate[currentLanguage]
    setCode(newCode)
    editorRef.current?.setValue(newCode)
  }

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
      onCodeChange?.(value)
    }
  }

  return (
    <motion.div
      className={cn(
        'flex flex-col rounded-xl border border-border bg-card overflow-hidden',
        'focus-within:border-primary/50 focus-within:shadow-[0_0_20px_rgba(99,102,241,0.2)]',
        'transition-all duration-300',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                currentLanguage === lang
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {languageLabels[lang]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2">
            <button
              onClick={() => handleFontSizeChange(-1)}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-[2rem] text-center text-xs font-medium">{fontSize}px</span>
            <button
              onClick={() => handleFontSizeChange(1)}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={handleThemeChange}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {currentTheme === 'vs-dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={handleReset}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="h-[500px]">
        <Editor
          height="100%"
          language={currentLanguage}
          theme={currentTheme}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          options={{
            fontSize,
            minimap: { enabled: false },
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: currentLanguage === 'python' ? 4 : 2,
          }}
        />
      </div>
    </motion.div>
  )
}

export default CodeEditor
