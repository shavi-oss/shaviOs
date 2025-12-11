"use client";

import { useState } from 'react';
import {
    Upload,
    File,
    Folder,
    Download,
    Trash2,
    Search,
    Filter
} from 'lucide-react';

export default function TrainerFilesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    const files = [
        { id: '1', name: 'JavaScript Basics.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '2024-12-10', category: 'Materials' },
        { id: '2', name: 'React Hooks Lecture.pptx', type: 'pptx', size: '5.1 MB', uploadedAt: '2024-12-09', category: 'Materials' },
        { id: '3', name: 'Session Recording - Dec 5.mp4', type: 'mp4', size: '125 MB', uploadedAt: '2024-12-05', category: 'Recordings' },
        { id: '4', name: 'Assignment 1 Solutions.pdf', type: 'pdf', size: '890 KB', uploadedAt: '2024-12-08', category: 'Solutions' },
        { id: '5', name: 'Student Reports - Week 12.xlsx', type: 'xlsx', size: '1.2 MB', uploadedAt: '2024-12-07', category: 'Reports' }
    ];

    const stats = {
        totalFiles: files.length,
        totalSize: '134.5 MB',
        materials: 2,
        recordings: 1,
        reports: 1
    };

    const getFileIcon = (type: string) => {
        return <File className="w-8 h-8 text-blue-500" />;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Folder className="w-6 h-6 text-primary" />
                        File Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Upload and manage training materials</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload File
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalFiles}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Total Files</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-black text-blue-600">{stats.totalSize}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Total Size</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl font-black text-purple-600">{stats.materials}</div>
                    <div className="text-xs text-purple-700 dark:text-purple-400 font-medium mt-1">Materials</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-black text-green-600">{stats.recordings}</div>
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium mt-1">Recordings</div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search files..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-lg text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'materials', 'recordings', 'reports'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-2 rounded-lg text-sm font-bold capitalize ${filterType === type
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Files Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map(file => (
                    <div key={file.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all">
                        <div className="flex items-start gap-4">
                            {getFileIcon(file.type)}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate">{file.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                        {file.category}
                                    </span>
                                    <span className="text-xs text-gray-500">{file.size}</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                    Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-1">
                                <Download className="w-3 h-3" /> Download
                            </button>
                            <button className="px-3 py-1 bg-red-100 text-red-600 rounded text-xs font-bold hover:bg-red-200">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upload Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-2">📁 File Upload Instructions</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Maximum file size: 100 MB</li>
                    <li>• Supported formats: PDF, PPTX, DOCX, MP4, XLSX</li>
                    <li>• Files will be stored in TeraBox/Google Drive</li>
                    <li>• Students can download materials from their dashboard</li>
                </ul>
            </div>
        </div>
    );
}
