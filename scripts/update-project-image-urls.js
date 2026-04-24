require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../src/config/db");
const Project = require("../src/models/Project");

const OLD_HOST =
  process.env.OLD_S3_HOST || "https://funflick-toys.s3.eu-north-1.amazonaws.com";
const NEW_HOST =
  process.env.NEW_S3_HOST || "https://globalinfraa.s3.eu-north-1.amazonaws.com";
const shouldApply = process.argv.includes("--apply");

const replaceHost = (url = "") =>
  typeof url === "string" && url.startsWith(OLD_HOST) ? url.replace(OLD_HOST, NEW_HOST) : url;

const buildGalleryImages = (galleryImages = []) =>
  galleryImages.map((image) => ({
    ...image.toObject?.() ?? image,
    url: replaceHost(image.url)
  }));

const run = async () => {
  await connectDB();

  const projects = await Project.find({
    $or: [
      { "coverImage.url": { $regex: `^${OLD_HOST.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` } },
      { "galleryImages.url": { $regex: OLD_HOST.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") } }
    ]
  });

  if (!projects.length) {
    console.log(`No projects found with URLs using ${OLD_HOST}`);
    return;
  }

  const operations = [];
  let coverUpdates = 0;
  let galleryUpdates = 0;

  for (const project of projects) {
    const nextCoverUrl = replaceHost(project.coverImage?.url);
    const nextGalleryImages = buildGalleryImages(project.galleryImages);
    const changedGalleryCount = nextGalleryImages.reduce(
      (count, image, index) => count + (image.url !== project.galleryImages[index]?.url ? 1 : 0),
      0
    );
    const hasCoverChange = nextCoverUrl !== project.coverImage?.url;

    if (!hasCoverChange && !changedGalleryCount) {
      continue;
    }

    if (hasCoverChange) {
      coverUpdates += 1;
    }

    galleryUpdates += changedGalleryCount;

    operations.push({
      updateOne: {
        filter: { _id: project._id },
        update: {
          $set: {
            "coverImage.url": nextCoverUrl,
            galleryImages: nextGalleryImages
          }
        }
      }
    });

    console.log(
      [
        `slug=${project.slug}`,
        hasCoverChange ? "coverImage.url updated" : null,
        changedGalleryCount ? `galleryImages updated=${changedGalleryCount}` : null
      ]
        .filter(Boolean)
        .join(" | ")
    );
  }

  console.log(`Projects matched: ${projects.length}`);
  console.log(`Projects to update: ${operations.length}`);
  console.log(`Cover URLs to update: ${coverUpdates}`);
  console.log(`Gallery URLs to update: ${galleryUpdates}`);
  console.log(`Mode: ${shouldApply ? "apply" : "dry-run"}`);

  if (!shouldApply || !operations.length) {
    return;
  }

  const result = await Project.bulkWrite(operations, { ordered: false });
  console.log(`Bulk write complete. Modified documents: ${result.modifiedCount}`);
};

run()
  .catch((error) => {
    console.error("Failed to update project image URLs:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
