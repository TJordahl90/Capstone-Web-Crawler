# Generated by Django 4.2.19 on 2025-04-10 02:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0023_remove_jobposting_requirements_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='CommonJobPreferences',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Experience',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('company', models.CharField(max_length=50)),
                ('title', models.CharField(max_length=50)),
                ('location', models.CharField(blank=True, max_length=50, null=True)),
                ('startDate', models.DateField(blank=True, null=True)),
                ('description', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='account',
            name='certifications',
        ),
        migrations.RemoveField(
            model_name='education',
            name='account',
        ),
        migrations.AddField(
            model_name='account',
            name='accountImage',
            field=models.ImageField(blank=True, null=True, upload_to='api/uploads'),
        ),
        migrations.AddField(
            model_name='account',
            name='education',
            field=models.ManyToManyField(blank=True, to='api.education'),
        ),
        migrations.AddField(
            model_name='account',
            name='location',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='account',
            name='resume',
            field=models.FileField(blank=True, null=True, upload_to='api/uploads'),
        ),
        migrations.AddField(
            model_name='account',
            name='summary',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='education',
            name='degree',
            field=models.CharField(default='n/a', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='education',
            name='gpa',
            field=models.FloatField(default=4.0),
            preserve_default=False,
        ),
        migrations.RemoveField(
            model_name='account',
            name='experience',
        ),
        migrations.AlterField(
            model_name='account',
            name='skills',
            field=models.ManyToManyField(blank=True, to='api.commonskills'),
        ),
        migrations.AddField(
            model_name='account',
            name='jobPrefs',
            field=models.ManyToManyField(blank=True, to='api.commonjobpreferences'),
        ),
        migrations.AddField(
            model_name='account',
            name='experience',
            field=models.ManyToManyField(blank=True, to='api.experience'),
        ),
    ]
