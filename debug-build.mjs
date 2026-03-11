import { build } from 'vite';

async function runBuild() {
  try {
    await build();
    console.log('Build successful');
  } catch (error) {
    console.error('BUILD ERROR FULL DUMP:');
    console.error(error);
    if (error.id) console.error('Error ID:', error.id);
    if (error.loc) console.error('Error Location:', error.loc);
    if (error.frame) console.error('Error Frame:\n', error.frame);
  }
}

runBuild();
