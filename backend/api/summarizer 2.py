import re
from .models import *
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

model_name = "google/flan-t5-large"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Create the pipeline once
generator = pipeline("text2text-generation", model=model, tokenizer=tokenizer)

def getJobSummary(description):
    try:
        summary = summarizer(description, max_length=120, min_length=60, do_sample=False)[0]['summary_text']
        return summary
    except Exception as e:
        print(f"Summarization error: {e}")
        return ""

def getMinRequirements(description):

    prompt = f"""
                Extract all the minimum requirements mentioned in this job description and return them as a Python list.

                Job description:
                {description}

                Output format:
                []
            """
    result = generator(prompt, max_new_tokens=256)
    return result[0]['generated_text']


def analyzeJobPost(description):
    summary = getJobSummary(description)
    minReqs = getMinRequirements(description)

    return {
        'Summary': summary,
        'minReqs': minReqs
    }

def test():
    description = "Change the world. Love your job. When you join TI, you will participate in the Career Accelerator Program (CAP), which provides professional and technical training and resources to accelerate your ramp into TI and set you up for long-term career success. Within this program, we also offer function-specific technical training and on-the-job learning opportunities that will encourage you to solve problems through a variety of hands-on, meaningful experiences from your very first day on the job. TI's FAST (Field Applications & Sales Training) Program is designed to prepare Sales & Applications team members for customer-oriented careers that pair technical skills with business perspectives. The program provides experiences that help rising TIers understand how to successfully grow TI's business and to thrive throughout their entire TI career. There are two available FAST program tracks: (1) Field Applications and (2) Technical Sales. Technical Sales Engineer track This 8-month experience aims to teach Technical Sales Associates (TSAs) how to build and manage customer relationships, and how to influence decisions to grow TI's revenue. The track includes 3 rotations: Rotation 1, Field Sales Office (FSO): This rotation integrates Technical Sales Associates with a local TI sales team, offering first-hand experience of TI's sales process. You will partner with customers and internal teams to uncover and win every possible customer opportunity, and also leverage our one-of-a-kind virtual account system to learn how to find, define, and win opportunities in a mix of real-time and simulated environments. Rotation 2, Mass Market (MM): The MM rotation is designed to train FAEs on how to scale any action within a given sector or EE across multiple customers. Rotators will participate in innovative projects to help create new and more efficient sales processes. This rotation focuses on learning how to leverage TI’s resources, automation, practice scalable selling techniques, decision making in imperfect circumstances, and direct customer interactions. Rotation 3, Business Unit/Systems Engineering & Marketing (BU/SEM): This rotation provides hands-on experiences that help future TSRs understand TI’s product lifecycles, 3-vector approach and operational savviness, both remotely and in person. This rotation focuses on understanding how the business and SEM play a role in our selling model. Upon successful completion of this track in the FAST program, rotators are welcomed as Technical Sales Representatives (TSRs) on TI's Worldwide Sales & Applications team. TSR responsibilities include: Using technical expertise, various sales tools and relationships with engineering teams to identify projects Managing and quantifying leads, and managing the commercial aspects of customer relationships Developing, forecasting and monitoring an annual plan for revenue growth Texas Instruments will not sponsor job applicants for visas or work authorization for this position. TEXAS REGION Deployment Locations: Upon successful completion of the Technical Sales Engineer track, rotators are deployed as TSEs on TI’s Worldwide Sales & Applications team. After the completion of the FAST program this position will be located at a Field Sales Office (FSOs) in the Texas Region. Cities included in the Texas Region are: Dallas, TX., Austin, TX. You can expect to travel up to 30% of the time. QUALIFICATIONS Minimum requirements: Bachelors degree in Electrical Engineering, Computer Engineering, Electrical and Computer Engineering or related field Cumulative 3.0/4.0 GPA or higher Preferred qualifications: Ability to effectively balance strong technical skills with solid relationship-building capabilities Demonstrated strong analytical and problem solving skills Strong written, verbal communication skills Ability to work in teams and collaborate effectively with people across various functions Strong time management skills that enable on-time project delivery Demonstrated ability to build strong, influential relationships Ability to work effectively in a fast-paced and rapidly changing environment Ability to take the initiative and drive for results "
    print(getJobSummary(description))

def allJob():
    jobs = JobPosting.objects.all()
    for job in jobs:
        description = job.description

        summary = getJobSummary(description)
        minReqs = getMinRequirements(description)

        job.summary = summary
        job.minimumRequirements = minReqs
        job.save()