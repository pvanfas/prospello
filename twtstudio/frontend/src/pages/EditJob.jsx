import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { jobAPI } from "../lib/api";
import JobForm from "../components/JobForm";

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobAPI.getJob(id),
  });

  const { mutate: updateJob, isPending } = useMutation({
    mutationFn: (formData) => jobAPI.updateJob(id, formData),
    onSuccess: () => navigate("/admin/jobs"),
    onError: (err) => alert("Failed to update job: " + err.message),
  });

  if (isLoadingJob) return <p>Loading...</p>;
  if (!job) return <p>Job not found</p>;

  return (
    <div className="p-6 bg-[#FDFCF6] shadow-sm border-b border-gray-200">
      <h1 className="text-2xl font-bold mb-4 ">Edit Job</h1>
      <JobForm
        initialData={job}
        onSubmit={updateJob}
        isSubmitting={isPending}
      />
    </div>
  );
};

export default EditJob;
