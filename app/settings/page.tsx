'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Zap,
  Mail,
  Calendar,
  Users,
  Bell,
  Shield,
  Bot,
  Workflow,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

interface AutomationSettings {
  actionItems: {
    enabled: boolean;
    autoExtract: boolean;
    autoAssign: boolean;
    priorityDetection: boolean;
    followUpReminders: boolean;
  };
  emails: {
    enabled: boolean;
    meetingSummaries: boolean;
    actionItemAlerts: boolean;
    dailyDigest: boolean;
    customTemplates: boolean;
  };
  calendar: {
    enabled: boolean;
    autoScheduleFollowUps: boolean;
    bufferTime: number;
    workingHours: {
      start: string;
      end: string;
    };
    excludeWeekends: boolean;
  };
  notifications: {
    enabled: boolean;
    realTime: boolean;
    email: boolean;
    slack: boolean;
    teams: boolean;
  };
  ai: {
    enabled: boolean;
    sentimentAnalysis: boolean;
    meetingInsights: boolean;
    participationTracking: boolean;
    keywordExtraction: boolean;
  };
  integrations: {
    slack: {
      enabled: boolean;
      webhookUrl: string;
      channels: string[];
    };
    teams: {
      enabled: boolean;
      webhookUrl: string;
    };
    jira: {
      enabled: boolean;
      apiKey: string;
      projectKey: string;
    };
    asana: {
      enabled: boolean;
      apiKey: string;
      workspaceId: string;
    };
  };
}

const defaultSettings: AutomationSettings = {
  actionItems: {
    enabled: true,
    autoExtract: true,
    autoAssign: false,
    priorityDetection: true,
    followUpReminders: true,
  },
  emails: {
    enabled: true,
    meetingSummaries: true,
    actionItemAlerts: true,
    dailyDigest: false,
    customTemplates: false,
  },
  calendar: {
    enabled: true,
    autoScheduleFollowUps: false,
    bufferTime: 15,
    workingHours: {
      start: '09:00',
      end: '17:00',
    },
    excludeWeekends: true,
  },
  notifications: {
    enabled: true,
    realTime: true,
    email: true,
    slack: false,
    teams: false,
  },
  ai: {
    enabled: true,
    sentimentAnalysis: true,
    meetingInsights: true,
    participationTracking: false,
    keywordExtraction: true,
  },
  integrations: {
    slack: {
      enabled: false,
      webhookUrl: '',
      channels: [],
    },
    teams: {
      enabled: false,
      webhookUrl: '',
    },
    jira: {
      enabled: false,
      apiKey: '',
      projectKey: '',
    },
    asana: {
      enabled: false,
      apiKey: '',
      workspaceId: '',
    },
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AutomationSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('automation');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Features', icon: Bot },
    { id: 'integrations', label: 'Integrations', icon: Workflow },
  ];

  const updateSettings = (section: keyof AutomationSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const updateNestedSettings = (section: keyof AutomationSettings, subsection: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [key]: value,
        },
      },
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Here you would save to your backend/database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-8 h-8 text-zinc-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Automation Settings
              </h1>
            </div>
            <p className="text-zinc-400 text-lg">
              Configure how AutoTrack AI handles your meetings and automates your workflow
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-6 sticky top-24">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-emerald-600 text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>

                {/* Save Actions */}
                <div className="mt-8 space-y-3">
                  <button
                    onClick={saveSettings}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-lg transition-all"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>

                  <button
                    onClick={resetSettings}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Default
                  </button>

                  {saved && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm">Settings saved!</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-8">
                {/* Automation Tab */}
                {activeTab === 'automation' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-6">Automation Settings</h2>
                      
                      {/* Action Items */}
                      <div className="space-y-6">
                        <div className="border border-zinc-700 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Target className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-white">Action Items</h3>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.actionItems.enabled}
                                onChange={(e) => updateSettings('actionItems', 'enabled', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Enable action item detection</span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.actionItems.autoExtract}
                                onChange={(e) => updateSettings('actionItems', 'autoExtract', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Auto-extract from transcripts</span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.actionItems.autoAssign}
                                onChange={(e) => updateSettings('actionItems', 'autoAssign', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Auto-assign to participants</span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.actionItems.priorityDetection}
                                onChange={(e) => updateSettings('actionItems', 'priorityDetection', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Priority detection</span>
                            </label>
                          </div>
                        </div>

                        {/* Email Automation */}
                        <div className="border border-zinc-700 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-5 h-5 text-green-400" />
                            <h3 className="text-lg font-semibold text-white">Email Automation</h3>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.emails.enabled}
                                onChange={(e) => updateSettings('emails', 'enabled', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Enable email automation</span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.emails.meetingSummaries}
                                onChange={(e) => updateSettings('emails', 'meetingSummaries', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Send meeting summaries</span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.emails.actionItemAlerts}
                                onChange={(e) => updateSettings('emails', 'actionItemAlerts', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Action item alerts</span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.emails.dailyDigest}
                                onChange={(e) => updateSettings('emails', 'dailyDigest', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Daily digest</span>
                            </label>
                          </div>
                        </div>

                        {/* Calendar Integration */}
                        <div className="border border-zinc-700 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Calendar className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-semibold text-white">Smart Calendar</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <label className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={settings.calendar.enabled}
                                  onChange={(e) => updateSettings('calendar', 'enabled', e.target.checked)}
                                  className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                                />
                                <span className="text-zinc-300">Enable smart scheduling</span>
                              </label>
                              
                              <label className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={settings.calendar.autoScheduleFollowUps}
                                  onChange={(e) => updateSettings('calendar', 'autoScheduleFollowUps', e.target.checked)}
                                  className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                                />
                                <span className="text-zinc-300">Auto-schedule follow-ups</span>
                              </label>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                  Buffer time (minutes)
                                </label>
                                <input
                                  type="number"
                                  min="5"
                                  max="60"
                                  value={settings.calendar.bufferTime}
                                  onChange={(e) => updateSettings('calendar', 'bufferTime', parseInt(e.target.value))}
                                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                  Start time
                                </label>
                                <input
                                  type="time"
                                  value={settings.calendar.workingHours.start}
                                  onChange={(e) => updateNestedSettings('calendar', 'workingHours', 'start', e.target.value)}
                                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                  End time
                                </label>
                                <input
                                  type="time"
                                  value={settings.calendar.workingHours.end}
                                  onChange={(e) => updateNestedSettings('calendar', 'workingHours', 'end', e.target.value)}
                                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Features Tab */}
                {activeTab === 'ai' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-6">AI Features</h2>
                      
                      <div className="space-y-6">
                        <div className="border border-zinc-700 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Bot className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.ai.enabled}
                                onChange={(e) => updateSettings('ai', 'enabled', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Enable AI features</span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.ai.sentimentAnalysis}
                                onChange={(e) => updateSettings('ai', 'sentimentAnalysis', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Sentiment analysis</span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.ai.meetingInsights}
                                onChange={(e) => updateSettings('ai', 'meetingInsights', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Meeting insights</span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.ai.participationTracking}
                                onChange={(e) => updateSettings('ai', 'participationTracking', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Participation tracking</span>
                            </label>
                          </div>
                          
                          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-blue-400 text-sm font-medium mb-1">AI Features Requirements</p>
                                <p className="text-blue-300 text-xs">
                                  Advanced AI features require Google Cloud Vertex AI to be properly configured. 
                                  Make sure your service account has the necessary permissions.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>
                      
                      <div className="space-y-6">
                        <div className="border border-zinc-700 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Bell className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-lg font-semibold text-white">Notification Channels</h3>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.notifications.enabled}
                                onChange={(e) => updateSettings('notifications', 'enabled', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Enable notifications</span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.notifications.realTime}
                                onChange={(e) => updateSettings('notifications', 'realTime', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Real-time notifications</span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.notifications.email}
                                onChange={(e) => updateSettings('notifications', 'email', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Email notifications</span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.notifications.slack}
                                onChange={(e) => updateSettings('notifications', 'slack', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Slack notifications</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Integrations Tab */}
                {activeTab === 'integrations' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-6">External Integrations</h2>
                      
                      <div className="space-y-6">
                        {/* Slack Integration */}
                        <div className="border border-zinc-700 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">#</span>
                              </div>
                              <h3 className="text-lg font-semibold text-white">Slack</h3>
                            </div>
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.integrations.slack.enabled}
                                onChange={(e) => updateNestedSettings('integrations', 'slack', 'enabled', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Enable</span>
                            </label>
                          </div>
                          
                          {settings.integrations.slack.enabled && (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                  Webhook URL
                                </label>
                                <input
                                  type="url"
                                  value={settings.integrations.slack.webhookUrl}
                                  onChange={(e) => updateNestedSettings('integrations', 'slack', 'webhookUrl', e.target.value)}
                                  placeholder="https://hooks.slack.com/services/..."
                                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Microsoft Teams Integration */}
                        <div className="border border-zinc-700 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                              <h3 className="text-lg font-semibold text-white">Microsoft Teams</h3>
                            </div>
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={settings.integrations.teams.enabled}
                                onChange={(e) => updateNestedSettings('integrations', 'teams', 'enabled', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-zinc-700 border-zinc-600 rounded focus:ring-emerald-500"
                              />
                              <span className="text-zinc-300">Enable</span>
                            </label>
                          </div>
                          
                          {settings.integrations.teams.enabled && (
                            <div>
                              <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Webhook URL
                              </label>
                              <input
                                type="url"
                                value={settings.integrations.teams.webhookUrl}
                                onChange={(e) => updateNestedSettings('integrations', 'teams', 'webhookUrl', e.target.value)}
                                placeholder="https://outlook.office.com/webhook/..."
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}