import { useState } from 'react';

export default function Dashboard() {
  const [stats] = useState({
    module: 12,
    moduleCompleted: 12,
    quizzesTaken: 12,
    averageScore: 12
  });

  // Dummy module data - two semesters with 7 modules each
  const semesters = [
    {
      id: 1,
      name: 'Semester 1',
      modules: Array(7).fill(null).map((_, i) => ({ id: i + 1, name: `Module ${i + 1}` }))
    },
    {
      id: 2,
      name: 'Semester 1',
      modules: Array(7).fill(null).map((_, i) => ({ id: i + 1, name: `Module ${i + 1}` }))
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Stats Cards */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          <div className="px-6 text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Module</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.module}</p>
          </div>
          <div className="px-6 text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Module Completed</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.moduleCompleted}</p>
          </div>
          <div className="px-6 text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Quizzes Taken</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.quizzesTaken}</p>
          </div>
          <div className="px-6 text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average Quiz Score</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.averageScore}</p>
          </div>
        </div>
      </div>

      {/* Semester Sections */}
      <div className="space-y-8">
        {semesters.map((semester) => (
          <div key={semester.id}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{semester.name}</h2>

            <div className="bg-gray-200 rounded-2xl p-10">
              <div className="flex items-center justify-between">
                {/* Module Circles */}
                <div className="flex gap-8">
                  {semester.modules.map((module) => (
                    <div
                      key={module.id}
                      className="w-24 h-24 bg-white rounded-full shadow hover:shadow-lg transition-all cursor-pointer hover:scale-105 flex items-center justify-center"
                      title={module.name}
                    >
                      <span className="text-gray-400 text-xs font-medium">M{module.id}</span>
                    </div>
                  ))}
                </div>

                {/* See More Button */}
                <button className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap ml-6">
                  See More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
