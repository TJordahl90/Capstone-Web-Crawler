# Generated by Django 4.2.19 on 2025-03-04 23:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_jobposting_savedjob'),
    ]

    operations = [
        migrations.CreateModel(
            name='JobTrentds',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('industry', models.CharField(max_length=255)),
                ('totalPostings', models.IntegerField()),
                ('averageSalary', models.DecimalField(decimal_places=2, max_digits=10)),
                ('trendingScore', models.FloatField()),
                ('lastUpdated', models.DateField()),
            ],
        ),
    ]
