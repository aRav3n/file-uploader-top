const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const bucketName = "files";

function getRelativePath(file) {
  // split the full path into an array
  const splitUpPathArray = file.filePath.split("/");
  const keepPathArray = [];
  let relativePathString = "";

  // if the item in the array comes after public and files then it's the start of the relative path
  for (let i = 0; i < splitUpPathArray.length; i++) {
    const isPublic = splitUpPathArray[i - 2] === "public";
    const isFiles = splitUpPathArray[i - 1] === "files";
    const fillingKeepPathArray = keepPathArray.length > 0;
    if ((isPublic && isFiles) || fillingKeepPathArray) {
      keepPathArray.push(splitUpPathArray[i]);
    }
  }

  // join all the relative path items back together with / after each item
  for (let i = 0; i < keepPathArray.length; i++) {
    relativePathString += keepPathArray[i];
    relativePathString += "/";
  }

  // remove the final /
  const fixedString = relativePathString.slice(0, -1);

  return fixedString;
}

async function deleteFile(file) {
  const relativePath = getRelativePath(file);
  const { data, error } = await supabase.storage
    .from(bucketName)
    .remove([relativePath]);
  console.log("file deleted successfully!");
  if (error) {
    console.error(error);
  }
  return;
}

async function deleteFolder(userId) {
  const folderName = userId.toString();
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(folderName);
  if (error) {
    console.error(error);
  }
  
  // delete all the user's files in supabase
  for (const file of data) {
    const relativePath = folderName + "/" + file.name;
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([relativePath]);
    if (error) {
      console.error(error);
    }
  }

  console.log("user's folder deleted!");
  return;
}

async function uploadFile(userId, file, filename) {
  const path = `${userId}/${filename}`;
  let url = null;
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file);
  console.log("supabase uploadFile data:", data);
  if (error) {
    console.error("error uploading file:", error);
  } else {
    url = `${supabaseUrl}/storage/v1/object/public/${data.fullPath}`;
    console.log("file uploaded successfully!");
  }
  return url;
}

module.exports = {
  deleteFile,
  deleteFolder,
  uploadFile,
};
