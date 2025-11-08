'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Mail, Calendar, ListTodo, Loader2, Play } from 'lucide-react';

interface Action {
  id: string;
  type: 'send_email' | 'schedule_meeting' | 'create_task';
  description: string;
  data: any;
  autoExecute?: boolean;
}

interface ActionExecutorProps {
  meetingId: string;
  recommendedActions: string[];
  actionItems: any[];
}

export default function ActionExecutor({ meetingId, recommendedActions, actionItems }: ActionExecutorProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);

  // Generate actionable items from recommendations
  const generateActions = () => {
    const generatedActions: Action[] = [];

    // Parse recommended actions and action items
    recommendedActions.forEach((recommendation, index) => {
      const lowerRec = recommendation.toLowerCase();

      // Detect email actions
      if (lowerRec.includes('email') || lowerRec.includes('send') || lowerRec.includes('notify')) {
        const emailMatch = recommendation.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        const recipient = emailMatch ? emailMatch[0] : 'anantsinghal2134@gmail.com';
        
        generatedActions.push({
          id: `email-${index}`,
          type: 'send_email',
          description: recommendation,
          data: {
            recipient,
            subject: `Follow-up: ${recommendation.substring(0, 50)}`,
            body: recommendation,
          }
        });
      }

      // Detect meeting scheduling actions
      if (lowerRec.includes('schedule') || lowerRec.includes('meeting') || lowerRec.includes('follow-up call')) {
        generatedActions.push({
          id: `meeting-${index}`,
          type: 'schedule_meeting',
          description: recommendation,
          data: {
            title: recommendation.substring(0, 100),
            participants: ['anantsinghal2134@gmail.com'],
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
            duration: 60,
            description: recommendation,
          }
        });
      }
    });

    // Convert action items to tasks
    actionItems.forEach((item, index) => {
      if (item.task) {
        generatedActions.push({
          id: `task-${index}`,
          type: 'create_task',
          description: item.task,
          data: {
            task: item.task,
            assignee: item.assignee || 'anantsinghal2134@gmail.com',
            priority: item.priority || 'medium',
            dueDate: item.dueDate || null,
          }
        });
      }
    });

    setActions(generatedActions);
    setShowGenerator(true);
  };

  const executeActions = async (selectedActions?: Action[]) => {
    const actionsToExecute = selectedActions || actions;
    
    if (actionsToExecute.length === 0) {
      alert('No actions to execute');
      return;
    }

    setExecuting(true);
    setResults([]);

    try {
      const response = await fetch('/api/meetings/execute-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId,
          actions: actionsToExecute,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        alert('Failed to execute actions: ' + data.error);
      }
    } catch (error) {
      console.error('Error executing actions:', error);
      alert('Failed to execute actions');
    } finally {
      setExecuting(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_email': return <Mail className="w-5 h-5" />;
      case 'schedule_meeting': return <Calendar className="w-5 h-5" />;
      case 'create_task': return <ListTodo className="w-5 h-5" />;
      default: return null;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'send_email': return 'bg-blue-100 text-blue-700';
      case 'schedule_meeting': return 'bg-green-100 text-green-700';
      case 'create_task': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!showGenerator && actions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Automated Actions</h3>
        <p className="text-gray-600 mb-4">
          Generate automated actions based on AI recommendations
        </p>
        <button
          onClick={generateActions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Actions
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Automated Actions</h3>
        <button
          onClick={() => executeActions()}
          disabled={executing || actions.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {executing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Execute All Actions
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {actions.map((action) => {
          const result = results.find(r => r.actionId === action.id);
          
          return (
            <div
              key={action.id}
              className={`border rounded-lg p-4 ${
                result ? (result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getActionColor(action.type)}`}>
                  {getActionIcon(action.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {action.type.replace('_', ' ')}
                    </h4>
                    {result && (
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  
                  {action.type === 'send_email' && (
                    <div className="mt-2 text-xs text-gray-500">
                      To: {action.data.recipient}
                    </div>
                  )}
                  
                  {action.type === 'schedule_meeting' && (
                    <div className="mt-2 text-xs text-gray-500">
                      Participants: {action.data.participants.join(', ')}
                    </div>
                  )}
                  
                  {action.type === 'create_task' && (
                    <div className="mt-2 text-xs text-gray-500">
                      Assignee: {action.data.assignee} | Priority: {action.data.priority}
                    </div>
                  )}
                  
                  {result && (
                    <div className={`mt-2 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      {result.success ? result.message : result.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {results.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Summary:</strong> {results.filter(r => r.success).length} of {results.length} actions completed successfully
          </p>
        </div>
      )}
    </div>
  );
}
