# LearnKick Admin Documentation 📚

## Overview
LearnKick's Question Bank Management System provides comprehensive tools for educational content administrators to manage, organize, and bulk-import questions for the learning platform.

## Admin Features

### 🎯 Question Bank Manager
- **Advanced Filtering**: Filter by subject, grade, difficulty, type, and language
- **Search Functionality**: Full-text search across questions, answers, and explanations
- **Bulk Operations**: Import/export CSV files, bulk delete selected questions
- **Real-time Validation**: Automated quality checks for question structure
- **Statistics Dashboard**: Analytics on question distribution

### 📊 Question Types Supported

1. **Multiple Choice** - Standard 4-option questions
2. **True/False** - Boolean statement verification
3. **Number Input** - Mathematical calculations
4. **Image Questions** - Visual questions with multiple choice answers

### 🏫 Educational Alignment

- **Grade Levels**: 1-6 (Ages 6-12)
- **Difficulty Levels**: 1-5 stars (Very Easy to Very Hard)
- **Subjects**: Mathematics, Geography, Language, General Knowledge
- **Languages**: English (EN), German (DE), French (FR)
- **Swiss Lehrplan21 Compatibility**: Aligned with educational standards

## CSV Import/Export Format

### CSV Structure
The system uses a standardized CSV format for bulk operations:

```csv
ID,Type,Subject,Grade,Difficulty,Language,Question,Statement,Answer A,Answer B,Answer C,Answer D,Correct Index,Correct Answer,Explanation,Unit,Image URL,Tags,Created At,Updated At
```

### Field Specifications

| Field | Required | Type | Description | Example |
|-------|----------|------|-------------|---------|
| ID | ✅ | String | Unique identifier | `math_3_1` |
| Type | ✅ | String | Question type | `multiple-choice` |
| Subject | ✅ | String | Educational subject | `math` |
| Grade | ✅ | Number | Grade level (1-6) | `3` |
| Difficulty | ✅ | Number | Difficulty (1-5) | `3` |
| Language | ✅ | String | Language code | `en` |
| Question | * | String | Question text | `What is 2 + 2?` |
| Statement | * | String | True/false statement | `The sky is blue.` |
| Answer A-D | ** | String | Multiple choice options | `2`, `3`, `4`, `5` |
| Correct Index | ** | Number | Correct answer index (0-based) | `2` |
| Correct Answer | *** | String/Number | For number input | `4` |
| Explanation | ❌ | String | Answer explanation | `2 + 2 equals 4` |
| Unit | ❌ | String | Unit for number answers | `cm`, `kg` |
| Image URL | **** | String | Image for image questions | `https://...` |
| Tags | ❌ | String | Semicolon-separated tags | `addition;basic` |
| Created At | ❌ | ISO Date | Creation timestamp | `2025-09-02T10:00:00.000Z` |
| Updated At | ❌ | ISO Date | Update timestamp | `2025-09-02T10:00:00.000Z` |

**Field Requirements:**
- `*` Required for question types except true-false
- `**` Required for multiple-choice and image-question types
- `***` Required for number-input type
- `****` Required for image-question type

### Question Type Examples

#### Multiple Choice Question
```csv
math_3_division,multiple-choice,math,3,3,en,"What is 12 ÷ 3?",,3,4,5,6,0,,Division means splitting into equal groups,,,addition;division,2025-09-02T10:00:00.000Z,2025-09-02T10:00:00.000Z
```

#### True/False Question
```csv
gk_2_animals,true-false,general-knowledge,2,2,en,,Elephants are the largest land animals.,,,,,,"Yes, elephants are the largest land animals on Earth",,animals;facts,2025-09-02T10:00:00.000Z,2025-09-02T10:00:00.000Z
```

#### Number Input Question
```csv
math_4_area,number-input,math,4,3,en,"What is the area of a rectangle with width 5cm and height 3cm?",,,,,,15,"Area = width × height = 5 × 3 = 15",cm²,,geometry;area,2025-09-02T10:00:00.000Z,2025-09-02T10:00:00.000Z
```

#### Image Question
```csv
geo_3_map,image-question,geography,3,3,en,"Which continent is highlighted in red?",,"North America","South America","Europe","Asia",2,,"The red highlighted continent is Europe",,"https://example.com/world-map.jpg",continents;geography,2025-09-02T10:00:00.000Z,2025-09-02T10:00:00.000Z
```

## Quality Control & Validation

### Automated Validation Rules

1. **Required Fields**: All mandatory fields must be present
2. **Grade Range**: Grade must be between 1-6
3. **Difficulty Range**: Difficulty must be between 1-5
4. **Answer Validation**: 
   - Multiple choice: At least 2 options, valid correct index
   - True/false: Boolean correct value must be set
   - Number input: Numeric correct answer required
   - Image questions: Valid image URL required
5. **Content Length**: Questions should be clear and appropriately sized
6. **Language Consistency**: Content should match the specified language

### Quality Guidelines

- **Question Clarity**: Use age-appropriate language
- **Answer Options**: Ensure distractors are plausible but incorrect
- **Explanations**: Provide educational explanations when possible
- **Swiss Standards**: Align with Lehrplan21 curriculum objectives
- **Difficulty Progression**: Ensure difficulty matches grade expectations

## Database Schema

### Questions Table
```sql
Questions {
  id: STRING (Primary Key)
  type: ENUM('multiple-choice', 'true-false', 'number-input', 'image-question')
  subject: ENUM('math', 'geography', 'language', 'general-knowledge')
  grade: INTEGER (1-6)
  difficulty: INTEGER (1-5)
  language: ENUM('en', 'de', 'fr')
  question: TEXT
  statement: TEXT (for true-false)
  answers: JSON_ARRAY (for multiple-choice)
  correctIndex: INTEGER (for multiple-choice)
  correct: BOOLEAN (for true-false)
  correctAnswer: STRING (for number-input)
  explanation: TEXT
  unit: STRING
  imageUrl: STRING
  tags: JSON_ARRAY
  timeLimit: INTEGER (milliseconds)
  lehrplan21Topic: STRING
  createdAt: DATETIME
  updatedAt: DATETIME
}
```

## Usage Instructions

### Accessing Admin Panel
1. Navigate to the LearnKick application
2. Access admin mode through the settings menu (requires admin authentication)
3. Click "Question Bank Manager" to open the admin interface

### Importing Questions
1. Prepare your CSV file following the format specification
2. Click "Import CSV" in the bulk actions section
3. Select your CSV file
4. Review the import results and handle any validation errors

### Exporting Questions
1. Use filters to select the questions you want to export
2. Optionally select specific questions using checkboxes
3. Click "Export CSV" to download the filtered questions
4. The CSV will include all question data for backup or sharing

### Managing Individual Questions
1. Use the search and filter tools to find specific questions
2. Click the edit icon to modify existing questions
3. Use the "Add Question" button to create new questions
4. Select multiple questions for bulk operations

## Performance Considerations

- **Indexing**: Database indexes on subject, grade, difficulty for fast filtering
- **Caching**: Static questions are cached for performance
- **Offline Support**: Questions are cached locally for offline access
- **Pagination**: Large question sets are paginated for better performance

## Security & Access Control

- **Admin Authentication**: Secure login required for admin features
- **Role-Based Access**: Different permission levels for different admin roles
- **Audit Logging**: All administrative actions are logged
- **Data Validation**: Server-side validation prevents malicious content

## Best Practices

### Content Creation
1. **Age-Appropriate**: Ensure content matches the target grade level
2. **Cultural Sensitivity**: Consider diverse backgrounds in examples
3. **Educational Value**: Every question should have clear learning objectives
4. **Balanced Difficulty**: Maintain appropriate distribution across difficulty levels

### System Management
1. **Regular Backups**: Export question banks regularly
2. **Quality Reviews**: Periodically review question performance metrics
3. **Content Updates**: Keep questions current and relevant
4. **Performance Monitoring**: Monitor system performance with large question sets

## Support & Troubleshooting

### Common Issues

**Import Failures**
- Check CSV format matches specification exactly
- Verify all required fields are present
- Ensure data types match expectations

**Validation Errors**
- Review field requirements for each question type
- Check grade and difficulty ranges
- Validate image URLs are accessible

**Performance Issues**
- Use filters to reduce result sets
- Consider pagination for large datasets
- Clear browser cache if interface becomes slow

### Contact Information
For technical support or feature requests regarding the Question Bank Management System, please contact the LearnKick development team.

---

*This documentation is for educational administrators and content managers using the LearnKick platform. Last updated: September 2025*