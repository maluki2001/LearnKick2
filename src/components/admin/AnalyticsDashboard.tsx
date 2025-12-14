'use client'

import { useState } from 'react'
import { User } from '@/lib/useAuth'
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Trophy, 
  Target,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SelectNative } from '@/components/ui/select-native'
import { Progress } from '@/components/ui/progress'
// import { Separator } from '@/components/ui/separator' // Unused
import { useAdminLanguage } from '@/contexts/AdminLanguageContext'

interface GameSession {
  id: string;
  student_name?: string;
  subject: string;
  grade?: number;
  accuracy: number;
  completed_at: string;
  questions_answered?: number;
  duration_seconds?: number;
}

interface AdminDataForAnalytics {
  totalGamesPlayed: number;
  averageAccuracy: number;
  totalQuestions: number;
  questionsBySubject: Record<string, number>;
  usersByRole: Record<string, number>;
  recentGames: GameSession[];
  isLoading: boolean;
}

interface AnalyticsDashboardProps {
  user: User
  adminData?: AdminDataForAnalytics
}

export function AnalyticsDashboard({ adminData }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d')
  const { t } = useAdminLanguage()

  // Generate sample performance trend data based on time range
  const generateTrendData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    const data = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      
      // Generate sample data with some realistic patterns
      const baseAccuracy = 70 + Math.random() * 15
      const weekendFactor = date.getDay() === 0 || date.getDay() === 6 ? 0.9 : 1
      const accuracy = Math.min(95, Math.max(50, baseAccuracy * weekendFactor))
      
      data.push({
        date: date.toISOString().split('T')[0],
        accuracy: Math.round(accuracy * 10) / 10,
        games: Math.floor(Math.random() * 20) + 5
      })
    }
    
    return data
  }

  const trendData = generateTrendData()
  
  const {
    totalGamesPlayed = 0,
    averageAccuracy = 0,
    // totalUsers = 0, // unused variable
    totalQuestions = 0,
    questionsBySubject = {},
    usersByRole = {},
    recentGames = [],
    isLoading
  } = adminData || {}

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    )
  }

  // Transform questionsBySubject into array for display
  const subjectData = Object.entries(questionsBySubject).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    accuracy: 75, // Default accuracy - in real app would calculate from game data
    games: Math.floor(count * 0.8) // Estimate games from question count
  }))

  // Transform usersByRole into grade data (students only)
  const gradeData = Array.from({length: 6}, (_, i) => ({
    grade: i + 1,
    accuracy: 75 + Math.random() * 15, // Random for demo - in real app would calculate
    students: Math.floor((usersByRole.student || 0) / 6) // Distribute students evenly
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{t.analyticsTitle}</h2>
          <p className="text-muted-foreground">{t.trackPerformance}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <SelectNative value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7d">{t.last7Days}</option>
            <option value="30d">{t.last30Days}</option>
            <option value="90d">{t.last3Months}</option>
            <option value="1y">{t.lastYear}</option>
          </SelectNative>
          
          <Button variant="secondary" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>{t.exportData}</span>
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title={t.gamesPlayed}
          value={totalGamesPlayed.toLocaleString()}
          change={totalGamesPlayed > 0 ? t.active : t.noData}
          icon={Trophy}
          color="bg-blue-500"
        />
        <AnalyticsCard
          title={t.avgAccuracy}
          value={averageAccuracy > 0 ? `${averageAccuracy}%` : t.noData}
          change={averageAccuracy > 75 ? t.good : averageAccuracy > 0 ? t.fair : t.noData}
          icon={Target}
          color="bg-green-500"
        />
        <AnalyticsCard
          title={t.students}
          value={(usersByRole.student || 0).toString()}
          change={usersByRole.student > 0 ? t.active : t.setupNeeded}
          icon={Users}
          color="bg-purple-500"
        />
        <AnalyticsCard
          title={t.totalQuestions}
          value={totalQuestions.toLocaleString()}
          change={totalQuestions > 0 ? t.active : t.setupNeeded}
          icon={BookOpen}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary" />
              {t.performanceBySubject}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectData.length > 0 ? subjectData.map((subject) => (
                <div key={subject.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{subject.name}</span>
                    <span className="text-sm text-muted-foreground">{Math.round(subject.accuracy)}%</span>
                  </div>
                  <Progress value={subject.accuracy} className="w-full" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {subject.games} {t.questionsAnswered}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>{t.noData}</p>
                  <p className="text-sm">{t.importFromCSV}</p>
                </div>
              )}
            </div>
        </CardContent>
        </Card>

        {/* Grade Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-green-600" />
              {t.performanceByGrade}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gradeData.map((grade) => (
                <div key={grade.grade} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">
                        {grade.grade}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t.grade} {grade.grade}</p>
                      <p className="text-sm text-muted-foreground">{grade.students || 0} {t.students}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{Math.round(grade.accuracy)}%</p>
                    <p className="text-xs text-muted-foreground">{t.estimated}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
              {t.performanceTrends}
            </CardTitle>
            <CardDescription>
              {t.averageAccuracyOverTime}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg p-4">
            <PerformanceChart data={trendData} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Performances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            {t.recentGameSessions}
          </CardTitle>
        </CardHeader>
        <CardContent>
        
        {recentGames.length > 0 ? (
          <div className="space-y-4">
            {recentGames.slice(0, 5).map((game) => (
              <div key={game.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {(game.student_name || 'Student').split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{game.student_name || t.unknownStudent}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.grade} {game.grade} • {game.subject.charAt(0).toUpperCase() + game.subject.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{Math.round(game.accuracy)}% {t.accuracy}</p>
                  <p className="text-sm text-muted-foreground">
                    {game.questions_answered || 0} {t.questions} • {Math.round((game.duration_seconds || 0) / 60)}{t.min}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">{t.noGameSessions}</p>
            <p className="text-sm">{t.studentsWillAppear}</p>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  )
}

function AnalyticsCard({ title, value, change, icon: Icon, color }: {
  title: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  const isPositive = change.startsWith('+')
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <Badge variant={isPositive ? "default" : "secondary"}>
            {change}
          </Badge>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          <p className="text-muted-foreground text-sm">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceChart({ data }: { data: Array<{ date: string; accuracy: number; games: number }> }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <p>No data available</p>
        </div>
      </div>
    )
  }

  const width = 800
  const height = 200
  const padding = { top: 20, right: 40, bottom: 40, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const minAccuracy = Math.min(...data.map(d => d.accuracy))
  const maxAccuracy = Math.max(...data.map(d => d.accuracy))
  const accuracyRange = maxAccuracy - minAccuracy || 1

  // Create SVG path for accuracy line
  const createPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return ''
    const [first, ...rest] = points
    return `M${first.x},${first.y}${rest.map(p => ` L${p.x},${p.y}`).join('')}`
  }

  const accuracyPoints = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartWidth,
    y: padding.top + ((maxAccuracy - d.accuracy) / accuracyRange) * chartHeight
  }))

  const accuracyPath = createPath(accuracyPoints)

  // Y-axis labels
  const yLabels = [
    { value: Math.round(maxAccuracy), y: padding.top },
    { value: Math.round((minAccuracy + maxAccuracy) / 2), y: padding.top + chartHeight / 2 },
    { value: Math.round(minAccuracy), y: padding.top + chartHeight }
  ]

  // X-axis labels (show only a few dates to avoid crowding)
  const xLabels = data.filter((_, i) => i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1)

  return (
    <div className="w-full h-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Grid lines */}
        {yLabels.map((label, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={label.y}
            x2={padding.left + chartWidth}
            y2={label.y}
            stroke="#e5e7eb"
            strokeDasharray="2,2"
          />
        ))}

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="#9ca3af"
          strokeWidth="1"
        />

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke="#9ca3af"
          strokeWidth="1"
        />

        {/* Accuracy line */}
        <path
          d={accuracyPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {accuracyPoints.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
            />
            {/* Tooltip on hover */}
            <title>{`${data[i].date}: ${data[i].accuracy}% accuracy, ${data[i].games} games`}</title>
          </g>
        ))}

        {/* Y-axis labels */}
        {yLabels.map((label, i) => (
          <text
            key={i}
            x={padding.left - 10}
            y={label.y}
            textAnchor="end"
            alignmentBaseline="middle"
            className="text-xs fill-muted-foreground"
          >
            {label.value}%
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map((d, i) => {
          const index = data.indexOf(d)
          const x = padding.left + (index / (data.length - 1)) * chartWidth
          return (
            <text
              key={i}
              x={x}
              y={padding.top + chartHeight + 20}
              textAnchor="middle"
              className="text-xs fill-muted-foreground"
            >
              {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          )
        })}

        {/* Chart title */}
        <text
          x={padding.left + chartWidth / 2}
          y={15}
          textAnchor="middle"
          className="text-sm font-medium fill-foreground"
        >
          Student Performance Trends
        </text>
      </svg>
    </div>
  )
}