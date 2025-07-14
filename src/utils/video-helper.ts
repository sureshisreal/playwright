import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';
import { testConfig } from '../config/test-config';

/**
 * Video helper for managing video recordings
 */
export class VideoHelper {
  private page: Page;
  private logger: Logger;
  private videoDir: string;
  private isRecording: boolean = false;
  private recordingPath: string | null = null;

  constructor(page: Page, videoDir: string = testConfig.videoDir) {
    this.page = page;
    this.logger = new Logger();
    this.videoDir = videoDir;
    this.ensureVideoDirectory();
  }

  /**
   * Ensure video directory exists
   */
  private ensureVideoDirectory(): void {
    if (!fs.existsSync(this.videoDir)) {
      fs.mkdirSync(this.videoDir, { recursive: true });
    }
  }

  /**
   * Generate video filename
   */
  private generateFilename(name?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testInfo = this.getTestInfo();
    const customName = name ? `_${name}` : '';
    
    return `${testInfo}_${timestamp}${customName}.webm`;
  }

  /**
   * Get test information for filename
   */
  private getTestInfo(): string {
    const testTitle = process.env.PLAYWRIGHT_TEST_TITLE || 'unknown_test';
    const testFile = process.env.PLAYWRIGHT_TEST_FILE || 'unknown_file';
    return `${path.basename(testFile, '.spec.ts')}_${testTitle}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Start video recording
   */
  async startRecording(name?: string): Promise<string> {
    try {
      if (this.isRecording) {
        this.logger.warn('Video recording is already in progress');
        return this.recordingPath!;
      }

      const filename = this.generateFilename(name);
      const filepath = path.join(this.videoDir, filename);
      
      // Note: Playwright automatically handles video recording based on config
      // This method is for manual control and metadata tracking
      this.recordingPath = filepath;
      this.isRecording = true;
      
      this.logger.video(`Started recording: ${filepath}`);
      return filepath;
    } catch (error) {
      this.logger.error(`Failed to start video recording: ${error}`);
      throw error;
    }
  }

  /**
   * Stop video recording
   */
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.isRecording) {
        this.logger.warn('No video recording in progress');
        return null;
      }

      // Get the actual video path from Playwright
      const videoPath = await this.page.video()?.path();
      
      if (videoPath && this.recordingPath) {
        // Move the video to our desired location
        if (fs.existsSync(videoPath)) {
          fs.renameSync(videoPath, this.recordingPath);
        }
      }

      this.isRecording = false;
      const finalPath = this.recordingPath;
      this.recordingPath = null;
      
      this.logger.video(`Stopped recording: ${finalPath}`);
      return finalPath;
    } catch (error) {
      this.logger.error(`Failed to stop video recording: ${error}`);
      throw error;
    }
  }

  /**
   * Get video recording status
   */
  getRecordingStatus(): { isRecording: boolean; path: string | null } {
    return {
      isRecording: this.isRecording,
      path: this.recordingPath,
    };
  }

  /**
   * Save video on test failure
   */
  async saveFailureVideo(): Promise<string | null> {
    try {
      const videoPath = await this.page.video()?.path();
      
      if (videoPath && fs.existsSync(videoPath)) {
        const filename = this.generateFilename('FAILURE');
        const filepath = path.join(this.videoDir, filename);
        
        fs.copyFileSync(videoPath, filepath);
        
        this.logger.video(`Failure video saved: ${filepath}`);
        this.logger.error(`Test failed - video saved: ${filepath}`);
        return filepath;
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Failed to save failure video: ${error}`);
      return null;
    }
  }

  /**
   * Save video on test success
   */
  async saveSuccessVideo(): Promise<string | null> {
    try {
      const videoPath = await this.page.video()?.path();
      
      if (videoPath && fs.existsSync(videoPath)) {
        const filename = this.generateFilename('SUCCESS');
        const filepath = path.join(this.videoDir, filename);
        
        fs.copyFileSync(videoPath, filepath);
        
        this.logger.video(`Success video saved: ${filepath}`);
        return filepath;
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Failed to save success video: ${error}`);
      return null;
    }
  }

  /**
   * Get video metadata
   */
  async getVideoMetadata(videoPath: string): Promise<{
    filepath: string;
    filename: string;
    size: number;
    created: Date;
    duration?: number;
  }> {
    try {
      const stats = fs.statSync(videoPath);
      
      // Basic metadata - duration would require video analysis library
      return {
        filepath: videoPath,
        filename: path.basename(videoPath),
        size: stats.size,
        created: stats.birthtime,
      };
    } catch (error) {
      this.logger.error(`Failed to get video metadata: ${error}`);
      throw error;
    }
  }

  /**
   * List all videos for current test
   */
  async listVideos(): Promise<string[]> {
    try {
      const files = fs.readdirSync(this.videoDir);
      const testInfo = this.getTestInfo();
      
      return files
        .filter(file => file.startsWith(testInfo) && file.endsWith('.webm'))
        .map(file => path.join(this.videoDir, file));
    } catch (error) {
      this.logger.error(`Failed to list videos: ${error}`);
      return [];
    }
  }

  /**
   * Clean up old videos
   */
  async cleanupOldVideos(daysOld: number = 7): Promise<void> {
    try {
      const files = fs.readdirSync(this.videoDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      for (const file of files) {
        const filepath = path.join(this.videoDir, file);
        const stats = fs.statSync(filepath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filepath);
          this.logger.info(`Deleted old video: ${filepath}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup old videos: ${error}`);
    }
  }

  /**
   * Convert video format (requires ffmpeg)
   */
  async convertVideo(inputPath: string, outputPath: string, format: 'mp4' | 'avi' | 'mov' = 'mp4'): Promise<string> {
    try {
      const { spawn } = require('child_process');
      
      return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-i', inputPath,
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-strict', 'experimental',
          outputPath
        ]);

        ffmpeg.on('close', (code: number) => {
          if (code === 0) {
            this.logger.info(`Video converted successfully: ${outputPath}`);
            resolve(outputPath);
          } else {
            reject(new Error(`FFmpeg process exited with code ${code}`));
          }
        });

        ffmpeg.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error) {
      this.logger.error(`Failed to convert video: ${error}`);
      throw error;
    }
  }

  /**
   * Create video thumbnail
   */
  async createThumbnail(videoPath: string, outputPath: string, timeOffset: string = '00:00:01'): Promise<string> {
    try {
      const { spawn } = require('child_process');
      
      return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-i', videoPath,
          '-ss', timeOffset,
          '-vframes', '1',
          '-f', 'image2',
          outputPath
        ]);

        ffmpeg.on('close', (code: number) => {
          if (code === 0) {
            this.logger.info(`Video thumbnail created: ${outputPath}`);
            resolve(outputPath);
          } else {
            reject(new Error(`FFmpeg process exited with code ${code}`));
          }
        });

        ffmpeg.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error) {
      this.logger.error(`Failed to create video thumbnail: ${error}`);
      throw error;
    }
  }

  /**
   * Get video duration
   */
  async getVideoDuration(videoPath: string): Promise<number> {
    try {
      const { spawn } = require('child_process');
      
      return new Promise((resolve, reject) => {
        const ffprobe = spawn('ffprobe', [
          '-v', 'quiet',
          '-show_entries', 'format=duration',
          '-of', 'csv=p=0',
          videoPath
        ]);

        let output = '';
        ffprobe.stdout.on('data', (data: Buffer) => {
          output += data.toString();
        });

        ffprobe.on('close', (code: number) => {
          if (code === 0) {
            const duration = parseFloat(output.trim());
            resolve(duration);
          } else {
            reject(new Error(`FFprobe process exited with code ${code}`));
          }
        });

        ffprobe.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error) {
      this.logger.error(`Failed to get video duration: ${error}`);
      throw error;
    }
  }

  /**
   * Merge multiple videos
   */
  async mergeVideos(inputPaths: string[], outputPath: string): Promise<string> {
    try {
      const { spawn } = require('child_process');
      
      // Create concat file
      const concatFile = path.join(this.videoDir, 'concat_list.txt');
      const concatContent = inputPaths.map(path => `file '${path}'`).join('\n');
      fs.writeFileSync(concatFile, concatContent);

      return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-f', 'concat',
          '-safe', '0',
          '-i', concatFile,
          '-c', 'copy',
          outputPath
        ]);

        ffmpeg.on('close', (code: number) => {
          // Clean up concat file
          fs.unlinkSync(concatFile);
          
          if (code === 0) {
            this.logger.info(`Videos merged successfully: ${outputPath}`);
            resolve(outputPath);
          } else {
            reject(new Error(`FFmpeg process exited with code ${code}`));
          }
        });

        ffmpeg.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error) {
      this.logger.error(`Failed to merge videos: ${error}`);
      throw error;
    }
  }

  /**
   * Check if video recording is enabled
   */
  isVideoRecordingEnabled(): boolean {
    return testConfig.video;
  }

  /**
   * Get video file size
   */
  async getVideoSize(videoPath: string): Promise<number> {
    try {
      const stats = fs.statSync(videoPath);
      return stats.size;
    } catch (error) {
      this.logger.error(`Failed to get video size: ${error}`);
      throw error;
    }
  }

  /**
   * Delete video file
   */
  async deleteVideo(videoPath: string): Promise<void> {
    try {
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
        this.logger.info(`Deleted video: ${videoPath}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete video: ${error}`);
      throw error;
    }
  }
}
