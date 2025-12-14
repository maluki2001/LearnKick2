# 🎓 LearnKick Question Management System
## Senior Administrator Guide

## 📋 **QUESTION STRUCTURE SPECIFICATION**

### **Core Fields (Required)**
| Field | Type | Values | Description |
|-------|------|---------|-------------|
| `id` | string | Unique identifier | Format: `subject_grade_topic_sequence` |
| `type` | enum | `multiple-choice`, `true-false`, `number-input`, `image-question` | Question interaction type |
| `subject` | enum | `math`, `geography`, `language`, `general-knowledge` | Academic subject |
| `grade` | number | 1-6 | Swiss education grade level |
| `difficulty` | number | 1-5 | Cognitive complexity (1=basic, 5=advanced) |
| `language` | enum | `en`, `de`, `fr` | Interface language |
| `timeLimit` | number | 5000-30000 | Milliseconds for answer |
| `tags` | string[] | Comma-separated | Topic keywords for filtering |

### **Content Fields (Question-Type Specific)**

#### **Multiple Choice Questions**
| Field | Required | Description |
|-------|----------|-------------|
| `question` | ✅ | The question text |
| `answer1-4` | ✅ | Four answer options |
| `correctIndex` | ✅ | 0-3 (which answer is correct) |
| `explanation` | 📝 | Why this answer is correct |

#### **True/False Questions**
| Field | Required | Description |
|-------|----------|-------------|
| `statement` | ✅ | Statement to evaluate |
| `correctBoolean` | ✅ | `true` or `false` |
| `explanation` | 📝 | Reasoning |

#### **Number Input Questions**
| Field | Required | Description |
|-------|----------|-------------|
| `question` | ✅ | Mathematical problem |
| `correctNumber` | ✅ | Numeric answer |
| `tolerance` | 📝 | Acceptable margin (±) |
| `unit` | 📝 | Measurement unit (cm, kg, etc.) |

#### **Image Questions**
| Field | Required | Description |
|-------|----------|-------------|
| `question` | ✅ | Question about image |
| `imageUrl` | ✅ | Path to image file |
| `answer1-4` | ✅ | Four answer options |
| `correctIndex` | ✅ | 0-3 (correct answer) |

---

## 🎯 **CURRICULUM ALIGNMENT (Lehrplan21)**

### **Mathematics (MA)**
- **MA.1.A.1**: Basic counting, number recognition
- **MA.1.A.2**: Addition, subtraction within 100
- **MA.1.A.3**: Multiplication, division, fractions
- **MA.1.A.4**: Decimals, percentages
- **MA.1.A.5**: Advanced arithmetic
- **MA.1.A.6**: Basic algebra, equations

### **Geography (NMG.8)**
- **NMG.8.1**: Local geography
- **NMG.8.2**: National geography  
- **NMG.8.3**: Continental geography
- **NMG.8.4**: World geography
- **NMG.8.5**: Political geography

### **Language (E/D/F)**
- **E.4.A.1**: Spelling, vocabulary
- **E.4.A.2**: Grammar, syntax
- **E.4.A.3**: Reading comprehension
- **E.4.A.4**: Writing skills

---

## ⚙️ **QUALITY ASSURANCE RULES**

### **Content Validation**
1. **Age Appropriateness**: Content must match cognitive development
2. **Cultural Sensitivity**: No cultural bias or stereotypes
3. **Language Complexity**: Vocabulary appropriate for grade level
4. **Visual Design**: Images must be clear, accessible

### **Technical Validation**
1. **ID Uniqueness**: No duplicate question IDs
2. **Answer Validation**: Multiple choice must have exactly 4 options
3. **Correct Index**: Must be valid (0-3 for multiple choice)
4. **Time Limits**: Reasonable for question complexity
5. **Image URLs**: Must be accessible and optimized

### **Educational Standards**
1. **Difficulty Progression**: Each grade builds on previous
2. **Topic Coverage**: Balanced across curriculum areas
3. **Assessment Validity**: Questions test intended knowledge
4. **Feedback Quality**: Explanations enhance learning

---

## 📈 **DIFFICULTY MATRIX**

| Grade | Difficulty 1 | Difficulty 2 | Difficulty 3 | Difficulty 4 | Difficulty 5 |
|-------|-------------|-------------|-------------|-------------|-------------|
| **1** | Recognition | Application | - | - | - |
| **2** | Recognition | Application | Analysis | - | - |
| **3** | Recognition | Application | Analysis | Synthesis | - |
| **4** | Application | Analysis | Synthesis | Evaluation | - |
| **5** | Application | Analysis | Synthesis | Evaluation | Creation |
| **6** | Analysis | Synthesis | Evaluation | Creation | Advanced |

---

## 🔧 **CSV IMPORT RULES**

### **File Format**
- **Encoding**: UTF-8 with BOM
- **Delimiter**: Comma (,)
- **Text Qualifier**: Double quotes (")
- **Line Endings**: LF or CRLF

### **Data Validation**
- **Required Fields**: Cannot be empty
- **Enum Values**: Must match exactly (case-sensitive)
- **Numeric Ranges**: Must be within specified bounds
- **URL Validation**: Images must be accessible
- **Text Length**: Question text 10-500 characters

### **Import Process**
1. **Pre-validation**: Check file format and structure
2. **Content Validation**: Validate each row against rules
3. **Duplicate Check**: Ensure no duplicate IDs
4. **Quality Review**: Flag questions needing human review
5. **Staging**: Import to staging database first
6. **Production Deploy**: After admin approval

---

## 📊 **ADMINISTRATIVE CONTROLS**

### **Content Management**
- **Version Control**: Track all changes to questions
- **Approval Workflow**: New questions require educator approval
- **Usage Analytics**: Track performance metrics
- **A/B Testing**: Compare question effectiveness

### **Quality Monitoring**
- **Performance Metrics**: Track answer rates, time-to-answer
- **Difficulty Calibration**: Adjust based on student performance
- **Content Updates**: Regular curriculum alignment reviews
- **Accessibility**: Screen reader and dyslexia-friendly formats

### **Security & Compliance**
- **Data Privacy**: COPPA/GDPR compliant question content  
- **Audit Logs**: Track all administrative changes
- **Backup Strategy**: Regular question bank backups
- **Access Control**: Role-based content management

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Phase 1: Core System** (Current)
- [x] Question type definitions
- [x] Basic filtering system
- [ ] CSV import functionality  
- [ ] Validation engine

### **Phase 2: Quality Assurance**
- [ ] Content review workflow
- [ ] Performance analytics
- [ ] Difficulty calibration
- [ ] A/B testing framework

### **Phase 3: Advanced Features**
- [ ] AI-powered question generation
- [ ] Adaptive difficulty adjustment
- [ ] Multi-modal questions (video, audio)
- [ ] Collaborative content creation

---

## 📞 **SUPPORT CONTACTS**

- **Technical Issues**: dev-team@learnkick.com
- **Content Questions**: content@learnkick.com  
- **Quality Assurance**: qa@learnkick.com
- **Administrator Training**: admin@learnkick.com

---

*Last Updated: September 2025*
*Version: 1.0*
*Document Owner: Senior Administrator*