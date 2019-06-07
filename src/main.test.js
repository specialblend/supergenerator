import Generator from 'yeoman-generator';
import createGenerator from './main';

describe('createGenerator', () => {
    test('is a function', () => {
        expect(createGenerator).toBeFunction();
    });
    describe('when called', () => {
        describe('throws expected error', () => {
            test('when root is empty or nil', () => {
                expect(() => createGenerator('')).toThrow('Root must be non-empty/nil');
                expect(() => createGenerator(null)).toThrow('Root must be non-empty/nil');
            });
            test.each([
                'resolvePackageJSON',
                'resolveFiles',
                'resolvePrompts',
                'resolveFreshDependencies',
                'resolveFreshDevDependencies',
            ])('when %p is not a Function', resolverName => {
                expect(() => createGenerator(Generator, 'root', { [resolverName]: true })).toThrow(`${resolverName} must be a function`);
            });
        });
        describe('result', () => {
            const generator = createGenerator(Generator, 'testRoot');
            test('is a function', () => {
                expect(generator).toBeFunction();
            });
            test('extends provided generator', () => {
                expect(generator.prototype).toBeInstanceOf(Generator);
            });
            test('has expected class methods', () => {
                expect(generator.prototype).toHaveProperty('prompting', expect.any(Function));
                expect(generator.prototype).toHaveProperty('initializing', expect.any(Function));
                expect(generator.prototype).toHaveProperty('writing', expect.any(Function));
                expect(generator.prototype).toHaveProperty('end', expect.any(Function));
            });
        });
    });
});
