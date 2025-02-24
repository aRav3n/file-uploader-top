const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const bucketName = "files";

async function getBucket() {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error("Error fetching files bucket:", error);
    return { error };
  }
}

async function uploadFile(userId, file, filename) {
  const path = `${userId}/${filename}`;
  let url = null;
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file);
  if (error) {
    console.error("error uploading file:", error);
  } else {
    url = `${supabaseUrl}/storage/v1/object/public/${data.fullPath}`;
    console.log("file uploaded successfully!");
  }
  return url;
}

module.exports = {
  getBucket,
  uploadFile,
};
