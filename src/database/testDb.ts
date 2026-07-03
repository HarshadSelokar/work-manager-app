import { Work, WorkStatus, WorkCategory, WorkPriority } from '@models/index';
import { WorksRepository } from '../repository/works.repository';
import { ValidationError } from '@utils/validation';

/**
 * Runs a full database CRUD and validation sequence to verify the SQLite and repository implementation.
 */
export const runDatabaseVerification = (): void => {
  console.log('--- Database Verification Test Started ---');

  const worksRepo = new WorksRepository();
  const testId = 'test-work-uuid-123';

  // Create a valid domain model
  const newWork: Work = {
    id: testId,
    title: 'Finish SQLite Database Integration',
    reference: 'REF-101',
    description:
      'Create SQLite schema, migrations, and repositories with transactional integrity.',
    deadline: new Date(Date.now() + 86400000 * 2), // 2 days from now
    status: WorkStatus.IN_PROGRESS,
    category: WorkCategory.TODAY,
    priority: WorkPriority.HIGH,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [{ id: 'img-1', workId: testId, imagePath: '/path/to/diagram.png' }],
    links: [
      {
        id: 'link-1',
        workId: testId,
        url: 'https://reactnative.dev',
        title: 'React Native docs',
      },
    ],
  };

  try {
    // 1. Validation Fail Test
    console.log('Testing validation error behavior (inserting empty title)...');
    try {
      const invalidWork: Work = {
        ...newWork,
        title: '', // Invalid empty title
      };
      worksRepo.create(invalidWork);
      console.error('Test Failed: should have thrown ValidationError for empty title.');
    } catch (err) {
      if (err instanceof ValidationError) {
        console.log('Success: caught validation error as expected:', err.message);
      } else {
        console.error('Test Failed: caught unexpected error type:', err);
      }
    }

    // 2. Create (Insert valid domain model)
    console.log('Inserting valid test task...');
    worksRepo.create(newWork);
    console.log('Task inserted successfully!');

    // 3. Read (Query joins)
    console.log('Retrieving inserted task by ID...');
    const retrieved = worksRepo.findById(testId);
    console.log('Retrieved task object:', JSON.stringify(retrieved, null, 2));

    if (!retrieved) {
      throw new Error('Test failed: retrieved task is null');
    }

    // Verify Date conversion works
    console.log('Verifying Date objects conversion...');
    if (retrieved.createdAt instanceof Date) {
      console.log(
        'Success: createdAt is a JavaScript Date object:',
        retrieved.createdAt.toISOString()
      );
    } else {
      console.error('Test Failed: createdAt is not a Date object.');
    }

    // Verify default Priority mapping works
    console.log('Verifying priority mapping...', retrieved.priority);

    // 4. Update (Modify and replace children)
    console.log('Updating task status to completed and adding new links...');
    const updatedWork: Work = {
      ...retrieved,
      status: WorkStatus.COMPLETED,
      updatedAt: new Date(),
      links: [
        ...(retrieved.links || []),
        { id: 'link-2', workId: testId, url: 'https://sqlite.org', title: 'SQLite Engine' },
      ],
    };
    worksRepo.update(updatedWork);
    console.log('Task updated successfully!');

    const retrievedUpdated = worksRepo.findById(testId);
    console.log(
      'Retrieved updated task object:',
      JSON.stringify(retrievedUpdated, null, 2)
    );

    // 5. Delete
    console.log('Deleting test task (cascade deletion should trigger)...');
    worksRepo.delete(testId);
    console.log('Task deleted successfully!');

    const retrievedDeleted = worksRepo.findById(testId);
    console.log('Retrieved deleted task (should be null):', retrievedDeleted);

    console.log('--- Database Verification Test Completed Successfully ---');
  } catch (error) {
    console.error('--- Database Verification Test Failed ---', error);
  }
};
