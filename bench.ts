import os from 'os';
import fs from 'fs/promises';
import { performance } from 'perf_hooks';

async function diagnoseEnvironment() {
  const cpuInfo = os.cpus()[0];

  // Test disk speed with a 100MB file
  async function testDiskSpeed() {
    const testFile = '/tmp/disk-speed-test';
    const fileSize = 100 * 1024 * 1024; // 100MB
    const buffer = Buffer.alloc(fileSize, 'x');

    try {
      // Write speed test
      const writeStart = performance.now();
      await fs.writeFile(testFile, buffer);
      const writeEnd = performance.now();
      const writeSpeed =
        fileSize / 1024 / 1024 / ((writeEnd - writeStart) / 1000);

      // Read speed test
      const readStart = performance.now();
      await fs.readFile(testFile);
      const readEnd = performance.now();
      const readSpeed = fileSize / 1024 / 1024 / ((readEnd - readStart) / 1000);

      // Cleanup
      await fs.unlink(testFile);

      return {
        writeMBps: writeSpeed.toFixed(2),
        readMBps: readSpeed.toFixed(2),
      };
    } catch (error) {
      return {
        error: `Failed to test disk speed: ${error.message}`,
      };
    }
  }

  const diskSpeed = await testDiskSpeed();

  console.log({
    // CPU Info
    cpuCores: os.cpus().length,
    cpuModel: cpuInfo.model,
    cpuSpeed: cpuInfo.speed,

    // Memory Info
    totalMemGB: Math.round(os.totalmem() / 1024 / 1024 / 1024),
    freeMemGB: Math.round(os.freemem() / 1024 / 1024 / 1024),

    // Load
    loadAverage: os.loadavg(),

    // Platform
    platform: os.platform(),
    release: os.release(),

    // Disk Speed (MB/s)
    diskSpeed,

    // Process Info
    pid: process.pid,
    uptime: process.uptime(),

    // Current working directory
    cwd: process.cwd(),

    // Node.js version
    nodeVersion: process.version,
  });
}

// Usage
diagnoseEnvironment().catch(console.error);
