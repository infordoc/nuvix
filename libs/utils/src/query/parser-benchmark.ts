import { performance } from 'perf_hooks';
import { Parser } from './parser';
import { OptimizedParser } from './parser-optimized';
import { memoryUsage } from 'process';

// Extended benchmark test cases
const testCases = [
    {
        name: 'Simple condition',
        input: 'name.eq("john")',
    },
    {
        name: 'Complex AND/OR',
        input: 'name.eq("john"),age.gt(18)|(status.eq("active"),role.in("admin","user"))',
    },
    {
        name: 'Deeply nested',
        input: '(name.eq("john")|name.eq("jane")),(age.gt(18),age.lt(65)),(status.eq("active")|status.eq("pending"))',
    },
    {
        name: 'Special functions',
        input: 'name.eq("john"),$.limit(10),$.offset(5),$.order("created_at.desc")',
    },
    {
        name: 'JSON fields',
        input: 'profile->name.eq("john"),settings->>theme.eq("dark")',
    },
    {
        name: 'Escaped characters',
        input: 'name.eq("john\\",doe"),description.eq("escaped \\"quote\\"")',
    },
    {
        name: 'Long expression',
        input: Array(100).fill('name.eq("john")').join('|'),
    },
    {
        name: 'Complex nested with special chars',
        input: '(name.eq("john\\",doe")|email.eq("john\\@example.com")),(settings->>theme.eq("dark"),(age.gt(18),age.lt(65)))',
    },
];

// Statistical utilities
interface Stats {
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
}

function calculateStats(times: number[]): Stats {
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = [...times].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const variance = times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);
    return { mean, median, min, max, stdDev };
}

// Deep comparison utility
function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();
    if (keysA.length !== keysB.length || keysA.some((k, i) => k !== keysB[i])) return false;
    return keysA.every(key => deepEqual(a[key], b[key]));
}

// Performance comparison function
export async function benchmarkParsers(iterations: number = 10000, warmupIterations: number = 100) {
    console.log('🏁 Parser Performance Benchmark\n');
    console.log(`Iterations: ${iterations}, Warm-up: ${warmupIterations}\n`);

    for (const testCase of testCases) {
        console.log(`\n=== ${testCase.name} ===`);
        console.log(`Input: ${testCase.input.length > 50 ? testCase.input.slice(0, 47) + '...' : testCase.input}\n`);

        // Warm-up phase
        const currentParser = Parser.create({ tableName: 'users' });
        const optimizedParser = OptimizedParser.create({ tableName: 'users' });

        for (let i = 0; i < warmupIterations; i++) {
            try {
                currentParser.parse(testCase.input);
                optimizedParser.parse(testCase.input);
            } catch (error) { }
        }

        // Performance test for current parser
        const currentTimes: number[] = [];
        let currentMemoryBefore = process.memoryUsage().heapUsed;
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            try {
                currentParser.parse(testCase.input);
            } catch (error) { }
            const end = performance.now();
            currentTimes.push(end - start);
        }
        const currentMemoryAfter = process.memoryUsage().heapUsed;
        const currentMemoryUsed = (currentMemoryAfter - currentMemoryBefore) / iterations;

        // Performance test for optimized parser
        const optimizedTimes: number[] = [];
        let optimizedMemoryBefore = process.memoryUsage().heapUsed;
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            try {
                optimizedParser.parse(testCase.input);
            } catch (error) { }
            const end = performance.now();
            optimizedTimes.push(end - start);
        }
        const optimizedMemoryAfter = process.memoryUsage().heapUsed;
        const optimizedMemoryUsed = (optimizedMemoryAfter - optimizedMemoryBefore) / iterations;

        // Calculate statistics
        const currentStats = calculateStats(currentTimes);
        const optimizedStats = calculateStats(optimizedTimes);
        const improvement = currentStats.mean / optimizedStats.mean;
        const memoryImprovement = currentMemoryUsed / optimizedMemoryUsed;

        console.log(`Current Parser:`);
        console.log(`  Mean:   ${currentStats.mean.toFixed(4)}ms`);
        console.log(`  Median: ${currentStats.median.toFixed(4)}ms`);
        console.log(`  Min:    ${currentStats.min.toFixed(4)}ms`);
        console.log(`  Max:    ${currentStats.max.toFixed(4)}ms`);
        console.log(`  StdDev: ${currentStats.stdDev.toFixed(4)}ms`);
        console.log(`  Memory: ${Math.round(currentMemoryUsed / 1024)}KB/iteration`);
        console.log(`Optimized Parser:`);
        console.log(`  Mean:   ${optimizedStats.mean.toFixed(4)}ms`);
        console.log(`  Median: ${optimizedStats.median.toFixed(4)}ms`);
        console.log(`  Min:    ${optimizedStats.min.toFixed(4)}ms`);
        console.log(`  Max:    ${optimizedStats.max.toFixed(4)}ms`);
        console.log(`  StdDev: ${optimizedStats.stdDev.toFixed(4)}ms`);
        console.log(`  Memory: ${Math.round(optimizedMemoryUsed / 1024)}KB/iteration`);
        console.log(`🚀 Improvement:   ${improvement.toFixed(2)}x ${improvement < 1 ? 'faster' : 'slower'} (optimized vs current)`);
        console.log(`📊 Memory:        ${memoryImprovement.toFixed(2)}x ${memoryImprovement < 1 ? 'less' : 'more'} usage (optimized vs current)`);
    }
}

// Error handling comparison
export function compareErrorHandling() {
    console.log('\n🚨 Error Handling Comparison\n');

    const errorCases = [
        'name.eq(',                  // Unclosed parenthesis
        'name..eq("test")',         // Double dot
        'name.eq("unclosed',        // Unclosed string
        '$.limit(abc)',             // Invalid number
        '',                         // Empty input
        'name.eq("\\invalid")',     // Invalid escape
        '((name.eq("john"))',       // Unbalanced parentheses
        'field->>path.',            // Trailing dot after JSON operator
    ];

    for (const errorCase of errorCases) {
        console.log(`\n--- Testing: "${errorCase.length > 50 ? errorCase.slice(0, 47) + '...' : errorCase}" ---`);

        // Test current parser
        let currentError: any = null;
        try {
            const currentParser = Parser.create({ tableName: 'users' });
            currentParser.parse(errorCase);
        } catch (error) {
            currentError = error;
        }
        console.log('Current Parser Error:');
        console.log(currentError ? {
            message: currentError.message.split('\n')[0],
            position: currentError.position,
            statement: currentError.statement,
            expected: currentError.expected,
            received: currentError.received
        } : 'No error thrown');

        // Test optimized parser
        let optimizedError: any = null;
        try {
            const optimizedParser = OptimizedParser.create({ tableName: 'users' });
            optimizedParser.parse(errorCase);
        } catch (error) {
            optimizedError = error;
        }
        console.log('Optimized Parser Error:');
        console.log(optimizedError ? {
            message: optimizedError.message.split('\n')[0],
            position: optimizedError.position,
            statement: optimizedError.statement,
            expected: optimizedError.expected,
            received: optimizedError.received
        } : 'No error thrown');
    }
}

// Feature parity test
export function testFeatureParity() {
    console.log('\n🔍 Feature Parity Test\n');

    const featureTests = [
        'name.eq("john")',
        'name.eq("john"),age.gt(18)',
        'name.eq("john")|age.gt(18)',
        '(name.eq("john"),age.gt(18))|status.eq("active")',
        '!name.eq("john")',
        'not(name.eq("john"))',
        'or(name.eq("john"),name.eq("jane"))',
        'and(name.eq("john"),age.gt(18))',
        'profile->name.eq("john")',
        'settings->>theme.eq("dark")',
        '$.limit(10)',
        '$.offset(5)',
        '$.order("name.asc")',
        '$.group("department")',
        'name.in("john","jane")',
        'name.eq(null)',
        'active.eq(true)',
        'description.eq("escaped \\"quote\\"")',
        'field->path->>subpath.eq("value")',
    ];

    let passed = 0;
    let failed = 0;

    for (const test of featureTests) {
        console.log(`\n--- Testing: "${test.length > 50 ? test.slice(0, 47) + '...' : test}" ---`);
        try {
            const currentParser = Parser.create({ tableName: 'users' });
            const optimizedParser = OptimizedParser.create({ tableName: 'users' });

            const currentResult = currentParser.parse(test);
            const optimizedResult = optimizedParser.parse(test);

            if (deepEqual(currentResult, optimizedResult)) {
                console.log(`✅ Passed`);
                passed++;
            } else {
                console.log(`❌ Failed`);
                console.log(`  Current:   ${JSON.stringify(currentResult, null, 2)}`);
                console.log(`  Optimized: ${JSON.stringify(optimizedResult, null, 2)}`);
                failed++;
            }
        } catch (error) {
            console.log(`⚠️  Error: ${error instanceof Error ? error.message.split('\n')[0] : 'Unknown'}`);
            failed++;
        }
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    console.log(`🎯 Success rate: ${(passed / (passed + failed) * 100).toFixed(1)}%`);
}

// Run all benchmarks
export async function runAllTests() {
    await benchmarkParsers();
    compareErrorHandling();
    testFeatureParity();
}
