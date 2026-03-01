/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bssbnvbvrquuvtzfifwn.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzc2JudmJ2cnF1dXZ0emZpZnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDMwMzYsImV4cCI6MjA4Nzg3OTAzNn0.f7ELXtSAGeBRL-YwTCNjGGdlvsHWl3qy9v9S3AltNcs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
